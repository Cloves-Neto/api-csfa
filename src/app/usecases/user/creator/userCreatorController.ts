import type { Request, Response } from "express";
import type UserCreatorService from "./userCreatorService";
import UserCreatorServiceImpl from "./userCreatorServiceImpl";

export default class UserCreatorController {
    private service: UserCreatorService;

    public constructor() {
        this.service = new UserCreatorServiceImpl();
    }

    public async create(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, password, role, status, accessSchedule, imageUrl, permissions, coordinatorId } = req.body;

            if (!email || !firstName || !password) {
                return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
            }

            const newUser = await this.service.create({
                firstName,
                lastName: lastName ?? null,
                email,
                password,
                role: role || "PROFESSOR",
                status: status || "ACTIVE",
                accessSchedule: accessSchedule || "FULL",
                imageUrl: imageUrl ?? null,
                permissions,
                coordinatorId: coordinatorId ?? null,
            });

            if (!newUser) {
                return res.status(500).json({ message: "Falha ao criar usuário." });
            }

            const currentUserId = (req as any).user?.id;
            if (currentUserId) {
                const { AuditLogService } = require("../../../../services/AuditLogService");
                await AuditLogService.log({
                    userId: currentUserId,
                    action: "CREATE_USER",
                    module: "USERS",
                    details: `Usuário ${email} criado.`,
                    ipAddress: req.ip,
                });
            }

            return res.status(201).json({
                message: "Usuário criado com sucesso!",
                data: newUser,
            });
        } catch (e: any) {
            const statusCode = e.message.includes("Já existe") ? 409 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao criar usuário." });
        }
    }
}
