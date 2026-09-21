import jwt from "jsonwebtoken";
import { AuthRepository } from "../../../repositories/auth/authRepository";
import VerifyEmailService from "./verifyEmailService";



export default class VerifyEmailServiceImpl implements VerifyEmailService {
    private authRepository: AuthRepository;
    private readonly jwtSecret = process.env.JWT_SECRET;

    public constructor() {
        this.authRepository = new AuthRepository();
    }

    public async verifyEmail(token: string): Promise<boolean> {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.userId) {
                throw new Error("Token inválido.");
            }
            const success = await this.authRepository.verifyUserEmail(decoded.userId);
            return success;
        } catch (e) {
            console.error("Erro ao verificar token de verificação:", e);
            throw new Error("Erro ao verificar token de verificação.");
        }
    }

    private decodeToken(token: string): { userId: string } | null {
        if (!token || !this.jwtSecret) {
            return null;
        }
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
            return decoded;
        } catch (e) {
            console.error("Token de verificação inválido:", e);
            return null;
        }
    }
}


