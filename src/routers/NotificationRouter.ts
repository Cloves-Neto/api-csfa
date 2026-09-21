import { Router } from "express";
import { authMiddleware, type CustomRequest } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";
import { NotificationService } from "../app/services/NotificationService";
import { AuditLogService } from "../app/services/AuditLogService";

const notificationRouter = Router();

// Listar notificações do usuário logado
notificationRouter.get("/", authMiddleware, async (req: CustomRequest, res) => {
    try {
        const notifications = await NotificationService.listForUser(req.user.id);
        return res.json(notifications);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar notificações." });
    }
});

// Marcar como lida
notificationRouter.patch("/:id/read", authMiddleware, async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        await NotificationService.markAsRead(id, req.user.id);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar notificação." });
    }
});

// Marcar todas como lidas
notificationRouter.patch("/read-all", authMiddleware, async (req: CustomRequest, res) => {
    try {
        await NotificationService.markAllAsRead(req.user.id);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar notificações." });
    }
});

// Histórico de notificações enviadas (ADMIN, COORDENACAO, SECRETARIA)
notificationRouter.get("/history", authMiddleware, requireRoles("ADMIN", "COORDENACAO", "SECRETARIA"), async (req: CustomRequest, res) => {
    try {
        const isAdmin = req.user.role === "ADMIN";
        const history = await NotificationService.listSent(req.user.id, isAdmin);
        return res.json(history);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar histórico de notificações." });
    }
});

// Criar nova notificação (ADMIN, COORDENACAO, SECRETARIA)
notificationRouter.post("/", authMiddleware, requireRoles("ADMIN", "COORDENACAO", "SECRETARIA"), async (req: CustomRequest, res) => {
    try {
        const { title, message, type, targetUserId, targetRole, isGlobal, actionUrl, attachmentUrl, attachmentType } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Título e mensagem são obrigatórios." });
        }

        const notification = await NotificationService.create({
            title,
            message,
            type,
            targetUserId: targetUserId || null,
            targetRole: targetRole || null,
            isGlobal: isGlobal || false,
            senderId: req.user.id,
            actionUrl,
            attachmentUrl,
            attachmentType,
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "SEND_NOTIFICATION",
            module: "NOTIFICATIONS",
            details: `Notificação enviada: "${title}" para ${targetUserId ? `usuário ${targetUserId}` : targetRole ? `perfil ${targetRole}` : "todos"}`,
            ipAddress: req.ip,
        });

        return res.status(201).json(notification);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar notificação." });
    }
});

// Excluir notificação enviada
notificationRouter.delete("/:id", authMiddleware, requireRoles("ADMIN", "COORDENACAO", "SECRETARIA", "TI"), async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        await NotificationService.delete(id);

        await AuditLogService.log({
            userId: req.user.id,
            action: "DELETE_NOTIFICATION",
            module: "NOTIFICATIONS",
            details: `Notificação ID ${id} foi excluída.`,
            ipAddress: req.ip,
        });

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao excluir notificação." });
    }
});

export { notificationRouter };
