import type { Request, Response } from "express";
import type VerifyEmailService from "./verifyEmailService";
import VerifyEmailServiceImpl from "./verifyEmailServiceImpl";

export default class VerifyEmailController {
    private verifyEmailService: VerifyEmailService;

    public constructor() {
        this.verifyEmailService = new VerifyEmailServiceImpl();
    }

    public async verifyEmail(req: Request, res: Response) {
        try {
            const token = req.query.token as string;
            
            if (!token) {
                return res.status(400).json({ message: "Token ausente." });
            }

            const success = await this.verifyEmailService.verifyEmail(token);
            if (success) {
                return res.status(200).json({ message: "E-mail verificado com sucesso!" });
            }
            
            return res.status(400).json({ message: "Não foi possível verificar o e-mail." });
        } catch (error: any) {
            return res.status(401).json({ message: error.message || "Token inválido." });
        }
    }
}
