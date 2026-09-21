import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IUserCreateData } from "../../models/iUserCreateData";
import type { IUserProps } from "../../models/iUserProps";

export class AuthRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async getUserByEmail(email: string): Promise<IUserProps | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            return user as unknown as IUserProps;
        } catch (e) {
            console.error(`Erro ao buscar usuário por email: ${e}`);
            return null;
        }
    }

    public async createUser(data: IUserCreateData): Promise<IUserProps | null> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    password: data.password!,
                    firstName: data.firstName,
                    lastName: data.lastName ?? null,
                    role: (data.role as any) || "PROFESSOR",
                    status: (data.status as any) || "ACTIVE",
                    accessSchedule: (data.accessSchedule as any) || "FULL",
                },
            });
            return user as unknown as IUserProps;
        } catch (e) {
            console.error(`Erro ao criar usuário: ${e}`);
            return null;
        }
    }

    public async getUserById(id: string): Promise<IUserProps | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    imageUrl: true,
                    emailVerifiedAt: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            return user as unknown as IUserProps;
        } catch (e) {
            console.error(`Erro ao buscar usuário por id: ${e}`);
            return null;
        }
    }

    public async verifyUserEmail(id: string): Promise<boolean> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { emailVerifiedAt: new Date() },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao verificar email do usuário: ${e}`);
            return false;
        }
    }

    public async updateUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { password: newPasswordHash },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao atualizar a senha do usuário: ${e}`);
            return false;
        }
    }
}
