import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IUserProps, IUserPermission } from "../../models/iUserProps";
import type { IUserCreateData } from "../../models/iUserCreateData";

export class UserCreatorRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async createUser(data: IUserCreateData & { permissions?: IUserPermission[] | undefined }): Promise<IUserProps | null> {
        try {
            const createPayload: any = {
                firstName: data.firstName,
                lastName: data.lastName ?? null,
                email: data.email,
                password: data.password!,
                role: data.role as any,
                status: (data.status as any) || "ACTIVE",
                accessSchedule: (data.accessSchedule as any) || "FULL",
                imageUrl: data.imageUrl ?? null,
                coordinatorId: data.coordinatorId ?? null,
                emailVerifiedAt: new Date(),
            };

            if (data.permissions && data.permissions.length > 0) {
                createPayload.permissions = {
                    create: data.permissions.map((p) => ({
                        moduleKey: p.moduleKey,
                        level: p.level,
                    })),
                };
            }

            const user = await this.prisma.user.create({
                data: createPayload,
                include: { permissions: true },
            });
            const { password: _, ...rest } = user;
            return rest as unknown as IUserProps;
        } catch (e) {
            console.error(`Erro ao criar usuário: ${e}`);
            return null;
        }
    }
}
