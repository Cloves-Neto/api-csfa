import { AuthRepository } from "../../../repositories/auth/authRepository";
import type LoginService from "./loginService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class LoginServiceImpl implements LoginService {
    private authRepository: AuthRepository;
    private readonly jwtSecret = process.env.JWT_SECRET || "csfa_cms_jwt_secret_key_2026";

    public constructor() {
        this.authRepository = new AuthRepository();
    }

    public async login(email: string, password: string): Promise<{ token: string; user: any } | null> {
        // Busca o usuário
        const user = await this.authRepository.getUserByEmail(email);
        if (!user) {
            throw new Error("Credenciais inválidas.");
        }

        // Verifica se o email foi confirmado
        if (!user.emailVerifiedAt) {
            throw new Error("Por favor, verifique seu e-mail antes de fazer login.");
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            throw new Error("Credenciais inválidas.");
        }

        // Remove a senha do objeto do usuário
        const { password: _, ...userWithoutPassword } = user as any;

        // Gera o token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            this.jwtSecret,
            { expiresIn: "5d" }
        );

        return {
            token,
            user: userWithoutPassword,
        };
    }
}
