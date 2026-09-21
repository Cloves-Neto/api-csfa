import type { Request, Response } from "express";
import type UserDeleterService from "./userDeleterService";
import UserDeleterServiceImpl from "./userDeleterServiceImpl";

export default class UserDeleterController {
    private service: UserDeleterService;

    public constructor() {
        this.service = new UserDeleterServiceImpl();
    }

    public async delete(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do usuário é obrigatório." });
            }

            const success = await this.service.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Usuário não encontrado ou erro ao excluir." });
            }

            const currentUserId = (req as any).user?.id;
            if (currentUserId) {
                const { AuditLogService } = require("../../../../services/AuditLogService");
                await AuditLogService.log({
                    userId: currentUserId,
                    action: "DELETE_USER",
                    module: "USERS",
                    details: `Usuário ID ${id} excluído.`,
                    ipAddress: req.ip,
                });
            }

            return res.status(200).json({ message: "Usuário excluído com sucesso!" });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao excluir usuário." });
        }
    }
}
