import express from "express";
import PostGetterController from "../app/usecases/post/getter/postGetterController";
import PostCreatorController from "../app/usecases/post/creator/postCreatorController";
import PostUpdaterController from "../app/usecases/post/updater/postUpdaterController";
import PostDeleterController from "../app/usecases/post/deleter/postDeleterController";
import { authMiddleware, optionalAuthMiddleware, type CustomRequest } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";
import PrismaSinglentonConnection from "../infrastructure/database/prisma/prismaSinglentonConnecion";
import { NotificationService } from "../app/services/NotificationService";
import { AuditLogService } from "../app/services/AuditLogService";

const prisma = PrismaSinglentonConnection.getConnection();
const PostsRouter = express.Router();

const postGetterController = new PostGetterController();
const postCreatorController = new PostCreatorController();
const postUpdaterController = new PostUpdaterController();
const postDeleterController = new PostDeleterController();

// 1. Fila de Revisão (Apenas ADMIN e COORDENACAO)
PostsRouter.get("/review-queue", authMiddleware, requireRoles("ADMIN", "COORDENACAO"), async (req: CustomRequest, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { status: "PENDING_REVIEW" },
            orderBy: { updatedAt: "desc" },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                tags: { include: { tag: true } },
            },
        });
        return res.json({ data: posts });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar fila de revisão." });
    }
});

// 2. Meus Posts (Para o Professor ver rascunhos, pendentes, devolvidos e publicados)
PostsRouter.get("/my-posts", authMiddleware, async (req: CustomRequest, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { authorId: req.user.id },
            orderBy: { updatedAt: "desc" },
            include: {
                tags: { include: { tag: true } },
                reviewedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        return res.json({ data: posts });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar seus posts." });
    }
});

// 3. Submeter Post para Revisão
PostsRouter.post("/:id/submit-review", authMiddleware, async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        const post = await prisma.post.findUnique({ 
            where: { id },
            include: { author: true } 
        });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado." });
        }

        if (req.user.role !== "ADMIN" && post.authorId !== req.user.id) {
            return res.status(403).json({ message: "Você não tem permissão para submeter este post." });
        }

        const updated = await prisma.post.update({
            where: { id },
            data: {
                status: "PENDING_REVIEW",
                published: false,
            },
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "SUBMIT_POST_REVIEW",
            module: "POSTS",
            details: `Post "${post.title}" submetido para revisão editorial.`,
            ipAddress: req.ip,
        });

        // Notifica a Coordenação (Específica do autor ou geral)
        const targetUserId = post.author?.coordinatorId || null;
        const targetRole = !targetUserId ? "COORDENACAO" : null;

        await NotificationService.create({
            title: "Nova Postagem para Revisão",
            message: `O professor ${post.author?.firstName || "Autor"} submeteu a postagem "${post.title}" para revisão.`,
            type: "INFO",
            targetUserId: targetUserId,
            targetRole: targetRole,
            senderId: req.user.id,
            actionUrl: "/dashboard/posts/revisao",
        });

        return res.json({ data: updated, message: "Post submetido para revisão com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao submeter post para revisão." });
    }
});

// 4. Aprovar Post (Apenas ADMIN e COORDENACAO)
PostsRouter.post("/:id/approve", authMiddleware, requireRoles("ADMIN", "COORDENACAO"), async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        const post = await prisma.post.findUnique({ where: { id } });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado." });
        }

        const updated = await prisma.post.update({
            where: { id },
            data: {
                status: "PUBLISHED",
                published: true,
                publishedAt: new Date(),
                reviewedById: req.user.id,
                reviewedAt: new Date(),
                reviewNotes: null,
            },
        });

        // Notifica o autor do post
        await NotificationService.create({
            title: "Post Aprovado e Publicado!",
            message: `Sua postagem "${post.title}" foi aprovada e já está no ar no site institucional.`,
            type: "SUCCESS",
            targetUserId: post.authorId,
            senderId: req.user.id,
            actionUrl: `/dashboard/posts`,
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "APPROVE_POST",
            module: "POSTS",
            details: `Post "${post.title}" aprovado e publicado.`,
            ipAddress: req.ip,
        });

        return res.json({ data: updated, message: "Post aprovado e publicado com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao aprovar post." });
    }
});

// 5. Devolver Post com Observações (Apenas ADMIN e COORDENACAO)
PostsRouter.post("/:id/return", authMiddleware, requireRoles("ADMIN", "COORDENACAO"), async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        const { reviewNotes } = req.body;

        if (!reviewNotes) {
            return res.status(400).json({ message: "Observações da devolução são obrigatórias." });
        }

        const post = await prisma.post.findUnique({ where: { id } });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado." });
        }

        const updated = await prisma.post.update({
            where: { id },
            data: {
                status: "RETURNED",
                published: false,
                reviewedById: req.user.id,
                reviewedAt: new Date(),
                reviewNotes,
            },
        });

        // Notifica o autor do post com as orientações
        await NotificationService.create({
            title: "Postagem Devolvida para Ajustes",
            message: `Sua postagem "${post.title}" foi devolvida pela Coordenação. Observação: ${reviewNotes}`,
            type: "WARNING",
            targetUserId: post.authorId,
            senderId: req.user.id,
            actionUrl: `/dashboard/posts/editar/${post.id}`,
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "RETURN_POST",
            module: "POSTS",
            details: `Post "${post.title}" devolvido para ajustes: "${reviewNotes}"`,
            ipAddress: req.ip,
        });

        return res.json({ data: updated, message: "Post devolvido para ajustes." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao devolver post." });
    }
});

// Rotas Públicas (Leitura) - com optionalAuthMiddleware para barrar vazamento de rascunhos
PostsRouter.get("/", optionalAuthMiddleware as any, postGetterController.getAll.bind(postGetterController));
PostsRouter.get("/posts", optionalAuthMiddleware as any, postGetterController.getAll.bind(postGetterController)); // Compatibilidade
PostsRouter.get("/:id", optionalAuthMiddleware as any, postGetterController.getById.bind(postGetterController));
PostsRouter.get("/posts/:postId", optionalAuthMiddleware as any, postGetterController.getById.bind(postGetterController)); // Compatibilidade

// Rotas Protegidas (Escrita)
const postWriteRoles = requireRoles("ADMIN", "COORDENACAO", "TI", "PROFESSOR");
PostsRouter.post("/", authMiddleware as any, postWriteRoles, postCreatorController.create.bind(postCreatorController));
PostsRouter.post("/posts", authMiddleware as any, postWriteRoles, postCreatorController.create.bind(postCreatorController)); // Compatibilidade
PostsRouter.put("/:id", authMiddleware as any, postWriteRoles, postUpdaterController.update.bind(postUpdaterController));
PostsRouter.patch("/:id/publish", authMiddleware as any, requireRoles("ADMIN", "COORDENACAO"), postUpdaterController.togglePublish.bind(postUpdaterController));
PostsRouter.delete("/:id", authMiddleware as any, requireRoles("ADMIN", "COORDENACAO"), postDeleterController.delete.bind(postDeleterController));

export default PostsRouter;