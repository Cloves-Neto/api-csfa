import type { Request, Response } from "express";
import type ResetPasswordService from "./resetPasswordService";
import ResetPasswordServiceImpl from "./resetPasswordServiceImpl";
import type { CustomRequest } from "../../../middlewares/authMiddleware";

export default class ResetPasswordController {
    private resetPasswordService: ResetPasswordService;

    public constructor() {
        this.resetPasswordService = new ResetPasswordServiceImpl();
    }

    public async requestReset(req: Request, res: Response) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "O e-mail é obrigatório." });
        }

        // Mesmo se der erro ou o email não existir, retornamos a mesma mensagem (prevenção contra enumeração de e-mails)
        await this.resetPasswordService.requestReset(email);
        return res.status(200).json({ message: "Se o e-mail existir, um link de redefinição foi enviado." });
    }

    public async confirmReset(req: Request, res: Response) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token e nova senha são obrigatórios." });
        }

        const success = await this.resetPasswordService.confirmReset(token, newPassword);
        
        if (success) {
            return res.status(200).json({ message: "Senha redefinida com sucesso." });
        } else {
            return res.status(400).json({ message: "Token inválido, expirado ou falha ao redefinir a senha." });
        }
    }

    public async adminReset(req: CustomRequest, res: Response) {
        const user = req.user;
        const { email, newPassword } = req.body;

        if (!user || user.role !== "TI") {
            return res.status(403).json({ message: "Acesso negado. Apenas contas de TI podem redefinir senhas diretamente." });
        }

        if (!email || !newPassword) {
            return res.status(400).json({ message: "E-mail do colaborador e nova senha são obrigatórios." });
        }

        const success = await this.resetPasswordService.adminReset(user.role, email, newPassword);

        if (success) {
            return res.status(200).json({ message: "Senha atualizada com sucesso pelo administrador." });
        } else {
            return res.status(400).json({ message: "Falha ao atualizar a senha. Verifique se o usuário existe." });
        }
    }
}
