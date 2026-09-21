import type { Request, Response } from "express";
import type RegisterService from "./registerService";
import RegisterServiceImpl from "./registerServiceImpl";
import type { IUserCreateData } from "../../../models/iUserCreateData";
import type { IUserProps } from "../../../models/iUserProps";

export default class RegisterController {
    private registerService: RegisterService;

    public constructor() {
        this.registerService = new RegisterServiceImpl();
    }

    public async register(req: Request, res: Response) {
        try {
            const data: IUserCreateData = req.body;

            if (!data.email || !data.password || !data.firstName || !data.lastName || !data.role) {
                return res.status(400).json({ message: "Nome, sobrenome, e-mail, senha e cargo são obrigatórios." });
            }

            const user = await this.registerService.register(data);

            if (user) {
                const { password, ...userWithoutPassword } = user as IUserProps;
                return res.status(201).json(userWithoutPassword);
            }
            return res.status(400).json({ message: "Falha ao registrar usuário." });
        } catch (e: any) {
            return res.status(400).json({ message: e.message || "Erro interno do servidor" });
        }
    }
}
