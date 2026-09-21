import type { Request, Response } from "express";
import type UserGetterService from "./userGetterService";
import UserGetterServiceImpl from "./userGetterServiceImpl";
import type { UserRole, UserStatus } from "../../../models/iUserProps";

export default class UserGetterController {
    private service: UserGetterService;

    public constructor() {
        this.service = new UserGetterServiceImpl();
    }

    public async getAll(req: Request, res: Response) {
        try {
            const { search, role, status, page, limit } = req.query;

            const result = await this.service.getAll({
                search: search ? String(search) : undefined,
                role: role ? (String(role).toUpperCase() as UserRole) : undefined,
                status: status ? (String(status).toUpperCase() as UserStatus) : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
            });

            return res.status(200).json({
                data: result.users,
                meta: result.meta,
            });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao listar usuários." });
        }
    }

    public async getById(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do usuário é obrigatório." });
            }

            const user = await this.service.getById(id);
            if (user) {
                return res.status(200).json({ data: user });
            }
            return res.status(404).json({ message: "Usuário não encontrado." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao buscar usuário." });
        }
    }
}
