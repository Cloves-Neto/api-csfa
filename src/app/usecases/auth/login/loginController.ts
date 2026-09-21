import type { Request, Response } from "express";
import type LoginService from "./loginService";
import LoginServiceImpl from "./loginServiceImpl";

export default class LoginController {
    private loginService: LoginService;

    public constructor() {
        this.loginService = new LoginServiceImpl();
    }

    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
            }

            const result = await this.loginService.login(email, password);

            if (result) {
                return res.status(200).json(result);
            }
            return res.status(401).json({ message: "Credenciais inválidas." });
        } catch (e: any) {
            return res.status(401).json({ message: e.message || "Credenciais inválidas." });
        }
    }
}
