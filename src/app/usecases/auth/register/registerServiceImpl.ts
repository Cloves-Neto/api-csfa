import { AuthRepository } from "../../../repositories/auth/authRepository";
import type { IUserCreateData } from "../../../models/iUserCreateData";
import type { IUserProps } from "../../../models/iUserProps";
import type { IEmailProvider } from "../../../models/iEmailProvider";
import NodemailerEmailProvider from "../../../../infrastructure/email/NodemailerEmailProvider";
import RegisterService from "./registerService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class RegisterServiceImpl implements RegisterService {
    private authRepository: AuthRepository;
    private emailProvider: IEmailProvider;

    public constructor(emailProvider?: IEmailProvider) {
        this.authRepository = new AuthRepository();
        this.emailProvider = emailProvider || new NodemailerEmailProvider();
    }

    public async register(data: IUserCreateData): Promise<IUserProps | null> {
        const existingUser = await this.authRepository.getUserByEmail(data.email);
        if (existingUser) {
            throw new Error("E-mail já está em uso.");
        }

        const hashedPassword = await this.hashPassword(data.password!);
        const newUserData: IUserCreateData = {
            ...data,
            password: hashedPassword,
        };

        const user = await this.authRepository.createUser(newUserData);

        if (user) {
            const magicLink = await this.createMagicLink(user);
            await this.sendVerificationEmail(user, magicLink);
        }

        return user;
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    private async createMagicLink(user: IUserProps): Promise<string> {
        const secret = process.env.JWT_SECRET || "fallback_secret";
        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });
        const magicLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        return magicLink;
    }

    private async sendVerificationEmail(user: IUserProps, magicLink: string): Promise<void> {
        await this.emailProvider.sendMail(
            user.email,
            "Verifique seu e-mail",
            `<p>Olá ${user.firstName},</p><p>Clique no link abaixo para verificar seu e-mail e ativar sua conta:</p><a href="${magicLink}">${magicLink}</a>`
        );
    }
}
