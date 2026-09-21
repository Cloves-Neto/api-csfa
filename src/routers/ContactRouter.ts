import { Router } from "express";
import PrismaSinglentonConnection from "../infrastructure/database/prisma/prismaSinglentonConnecion";
import { authMiddleware, type CustomRequest } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";
import { NotificationService } from "../app/services/NotificationService";
import { AuditLogService } from "../app/services/AuditLogService";

const prisma = PrismaSinglentonConnection.getConnection();
const contactRouter = Router();

// Handlers isolados
async function handleGeneralContact(req: any, res: any) {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Nome, e-mail e telefone são obrigatórios." });
        }

        const submission = await (prisma as any).contactSubmission.create({
            data: {
                type: "CONTACT",
                name,
                email,
                phone,
                subject: subject || "Dúvida Geral",
                message: message || "",
                status: "PENDING",
            },
        });

        // Notifica a equipe de atendimento (Secretaria e Admin)
        await NotificationService.create({
            title: `Nova Mensagem de Contato: ${name}`,
            message: `Assunto: ${subject || "Geral"} | Telefone: ${phone} | E-mail: ${email}`,
            type: "INFO",
            targetRole: "SECRETARIA",
            senderId: "",
            actionUrl: "/dashboard/atendimento",
        }).catch(() => null);

        return res.status(201).json({
            success: true,
            message: "Mensagem recebida com sucesso!",
            data: submission,
        });
    } catch (error: any) {
        console.error("Erro ao processar contato:", error);
        return res.status(500).json({ message: "Erro ao registrar contato." });
    }
}

async function handleCareers(req: any, res: any) {
    try {
        const { name, email, phone, interestArea, linkedinUrl, presentation, attachmentUrl, linkType, linkUrl } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Nome, e-mail e telefone são obrigatórios." });
        }

        const extraData = JSON.stringify({
            linkedinUrl: linkedinUrl || null,
            presentation: presentation || null,
            linkType: linkType || null,
            linkUrl: linkUrl || null,
        });

        const submission = await (prisma as any).contactSubmission.create({
            data: {
                type: "CAREERS",
                name,
                email,
                phone,
                subject: interestArea || "Área Não Especificada",
                message: presentation || "",
                attachmentUrl: attachmentUrl || null,
                extraData,
                status: "PENDING",
            },
        });

        // Notifica o setor administrativo / RH
        await NotificationService.create({
            title: `Novo Currículo Recebido: ${name}`,
            message: `Área: ${interestArea || "Geral"} | Telefone: ${phone} | E-mail: ${email}`,
            type: "INFO",
            targetRole: "ADMIN",
            senderId: "",
            actionUrl: "/dashboard/atendimento",
            attachmentUrl: attachmentUrl || undefined,
            attachmentType: "PDF",
        }).catch(() => null);

        return res.status(201).json({
            success: true,
            message: "Candidatura registrada com sucesso!",
            data: submission,
        });
    } catch (error: any) {
        console.error("Erro ao processar candidatura:", error);
        return res.status(500).json({ message: "Erro ao registrar candidatura." });
    }
}

async function handleAdmissions(req: any, res: any) {
    try {
        const { parentName, phone, email, studentName, birthDate, grade, notes } = req.body;

        if (!parentName || !phone || !email || !studentName) {
            return res.status(400).json({ message: "Dados do responsável e do aluno são obrigatórios." });
        }

        const extraData = JSON.stringify({
            studentName,
            birthDate: birthDate || null,
            grade: grade || null,
        });

        const submission = await (prisma as any).contactSubmission.create({
            data: {
                type: "ADMISSIONS",
                name: parentName,
                email,
                phone,
                subject: grade ? `Interesse: ${grade}` : "Reserva de Matrícula",
                message: notes || `Aluno: ${studentName}`,
                extraData,
                status: "PENDING",
            },
        });

        // Notifica a Secretaria
        await NotificationService.create({
            title: `Novo Interesse de Matrícula: ${studentName}`,
            message: `Responsável: ${parentName} | Turma: ${grade || "Não informada"} | Contato: ${phone}`,
            type: "SUCCESS",
            targetRole: "SECRETARIA",
            senderId: "",
            actionUrl: "/dashboard/atendimento",
        }).catch(() => null);

        return res.status(201).json({
            success: true,
            message: "Interesse de matrícula registrado com sucesso!",
            data: submission,
        });
    } catch (error: any) {
        console.error("Erro ao processar matrícula:", error);
        return res.status(500).json({ message: "Erro ao registrar matrícula." });
    }
}

// ==========================================
// 🌐 ROTAS PÚBLICAS (Submissões do Portal)
// ==========================================

contactRouter.post("/contact", handleGeneralContact);
contactRouter.post("/careers", handleCareers);
contactRouter.post("/admissions", handleAdmissions);

// Roteador inteligente para quando montado em /contact, /careers ou /admissions
contactRouter.post("/", async (req, res) => {
    const baseUrl = req.baseUrl || "";
    if (baseUrl.includes("careers")) {
        return handleCareers(req, res);
    }
    if (baseUrl.includes("admissions")) {
        return handleAdmissions(req, res);
    }
    // Caso padrão: Contato Geral
    return handleGeneralContact(req, res);
});

// ==========================================
// 🔒 ROTAS PROTEGIDAS (Painel CMS)
// ==========================================

const contactRoles = requireRoles("ADMIN", "SECRETARIA", "COORDENACAO", "TI");

// Listar todas as submissões com filtros
contactRouter.get("/submissions", authMiddleware, contactRoles, async (req: CustomRequest, res) => {
    try {
        const { type, status, search } = req.query;
        const where: any = {};

        if (type && type !== "ALL") {
            where.type = type as any;
        }
        if (status && status !== "ALL") {
            where.status = status as any;
        }
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: "insensitive" } },
                { email: { contains: String(search), mode: "insensitive" } },
                { phone: { contains: String(search), mode: "insensitive" } },
                { subject: { contains: String(search), mode: "insensitive" } },
            ];
        }

        const submissions = await (prisma as any).contactSubmission.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                history: {
                    orderBy: { createdAt: "desc" }
                }
            },
            take: 100,
        });

        return res.json({ data: submissions });
    } catch (error: any) {
        console.error("Erro ao buscar submissões:", error);
        return res.status(500).json({ message: "Erro ao buscar mensagens recebidas." });
    }
});

// Atualizar status ou notas da submissão
contactRouter.patch("/submissions/:id/status", authMiddleware, contactRoles, async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        const { status, notes } = req.body; // notes field used for note text in this request

        const submission = await (prisma as any).contactSubmission.findUnique({ where: { id } });
        if (!submission) return res.status(404).json({ message: "Submissão não encontrada." });

        const dataToUpdate: any = {};
        if (status) dataToUpdate.status = status;
        if (notes !== undefined) dataToUpdate.notes = notes;

        // Auditoria
        dataToUpdate.lastHandledById = req.user.id;
        dataToUpdate.lastHandledByName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ""}`.trim() : req.user.email;
        dataToUpdate.lastHandledByRole = req.user.role;
        dataToUpdate.lastHandledAt = new Date();

        const updated = await (prisma as any).contactSubmission.update({
            where: { id },
            data: dataToUpdate,
        });

        // Registrar no Histórico de Submissão
        await (prisma as any).contactSubmissionHistory.create({
            data: {
                submissionId: id,
                status: status || submission.status,
                note: notes || "",
                userId: req.user.id,
                userName: dataToUpdate.lastHandledByName,
                userRole: req.user.role,
            }
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "UPDATE_CONTACT_SUBMISSION",
            module: "SYSTEM",
            details: `Status da submissão (${updated.name} - ${updated.type}) alterado para ${status || updated.status}`,
            ipAddress: req.ip,
        });

        return res.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("Erro ao atualizar status:", error);
        return res.status(500).json({ message: "Erro ao atualizar status da submissão." });
    }
});

// Excluir submissão
contactRouter.delete("/submissions/:id", authMiddleware, requireRoles("ADMIN", "SECRETARIA", "TI"), async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        await (prisma as any).contactSubmission.delete({
            where: { id },
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "DELETE_CONTACT_SUBMISSION",
            module: "SYSTEM",
            details: `Submissão removida: ${id}`,
            ipAddress: req.ip,
        });

        return res.json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao remover submissão." });
    }
});

export { contactRouter };
