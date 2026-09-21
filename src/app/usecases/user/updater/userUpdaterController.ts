import type { Request, Response } from "express";
import type UserUpdaterService from "./userUpdaterService";
import UserUpdaterServiceImpl from "./userUpdaterServiceImpl";

export default class UserUpdaterController {
    private service: UserUpdaterService;

    public constructor() {
        this.service = new UserUpdaterServiceImpl();
    }

    public async update(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do usuário é obrigatório." });
            }

            const { firstName, lastName, password, role, status, accessSchedule, imageUrl, permissions, coordinatorId } = req.body;

            const updatedUser = await this.service.update(id, {
                firstName,
                lastName,
                password,
                role,
                status,
                accessSchedule,
                imageUrl,
                permissions,
                coordinatorId: coordinatorId ?? null,
            });

            const currentUserId = (req as any).user?.id;
            if (currentUserId) {
                const { AuditLogService } = require("../../../../services/AuditLogService");
                await AuditLogService.log({
                    userId: currentUserId,
                    action: "UPDATE_USER",
                    module: "USERS",
                    details: `Usuário ID ${id} atualizado.`,
                    ipAddress: req.ip,
                });
            }

            return res.status(200).json({
                message: "Usuário atualizado com sucesso!",
                data: updatedUser,
            });
        } catch (e: any) {
            const statusCode = e.message.includes("não encontrado") ? 404 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao atualizar usuário." });
        }
    }

    public async updateStatus(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            const { status } = req.body;

            if (!id || !status) {
                return res.status(400).json({ message: "ID e status são obrigatórios." });
            }

            const success = await this.service.updateStatus(id, status);
            if (!success) {
                return res.status(404).json({ message: "Usuário não encontrado ou erro ao alterar status." });
            }

            const currentUserId = (req as any).user?.id;
            if (currentUserId) {
                const { AuditLogService } = require("../../../../services/AuditLogService");
                await AuditLogService.log({
                    userId: currentUserId,
                    action: "UPDATE_USER_STATUS",
                    module: "USERS",
                    details: `Status do usuário ID ${id} alterado para ${status}.`,
                    ipAddress: req.ip,
                });
            }

            return res.status(200).json({ message: `Status do usuário atualizado para ${status}.` });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao atualizar status." });
        }
    }
}
