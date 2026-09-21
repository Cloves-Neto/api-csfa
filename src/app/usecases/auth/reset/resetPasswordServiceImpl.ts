import { AuthRepository } from "../../../repositories/auth/authRepository";
import type { IEmailProvider } from "../../../models/iEmailProvider";
import NodemailerEmailProvider from "../../../../infrastructure/email/NodemailerEmailProvider";
import ResetPasswordService from "./resetPasswordService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class ResetPasswordServiceImpl implements ResetPasswordService {
    private authRepository: AuthRepository;
    private emailProvider: IEmailProvider;
    private readonly jwtSecret = process.env.JWT_SECRET || "csfa_cms_jwt_secret_key_2026";

    public constructor() {
        this.authRepository = new AuthRepository();
        this.emailProvider = new NodemailerEmailProvider();
    }

    public async requestReset(email: string): Promise<boolean> {
        try {
            const user = await this.authRepository.getUserByEmail(email);
            if (!user) {
                // Para não expor se o e-mail existe, retornamos true mesmo assim
                return true;
            }

            const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: "1h" });
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

            await this.emailProvider.sendMail(
                user.email,
                "Redefinição de Senha",
                `<p>Olá ${user.firstName},</p><p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p><a href="${resetLink}">${resetLink}</a><p>Se você não solicitou, apenas ignore este e-mail.</p>`
            );

            return true;
        } catch (e) {
            console.error("Erro ao solicitar redefinição de senha:", e);
            return false;
        }
    }

    public async confirmReset(token: string, newPassword: string): Promise<boolean> {
        try {
            if (!token || !this.jwtSecret) {
                return false;
            }

            const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
            if (!decoded || !decoded.userId) {
                return false;
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            const success = await this.authRepository.updateUserPassword(decoded.userId, hashedPassword);
            return success;
        } catch (e) {
            console.error("Token de redefinição inválido ou erro ao resetar:", e);
            return false;
        }
    }

    public async adminReset(adminRole: string, targetEmail: string, newPassword: string): Promise<boolean> {
        try {
            // Apenas role TI pode resetar senhas diretamente
            if (adminRole !== "TI") {
                return false;
            }

            // Buscar o alvo pelo e-mail
            const user = await this.authRepository.getUserByEmail(targetEmail);
            if (!user) return false;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            const success = await this.authRepository.updateUserPassword(user.id, hashedPassword);
            return success;
        } catch (e) {
            console.error("Erro no reset admin de senha:", e);
            return false;
        }
    }
}
