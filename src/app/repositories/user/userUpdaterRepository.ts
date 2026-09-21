import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IUserProps, UserStatus, IUserPermission } from "../../models/iUserProps";
import type { IUserCreateData } from "../../models/iUserCreateData";

export class UserUpdaterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async updateUser(id: string, data: Partial<IUserCreateData> & { permissions?: IUserPermission[] | undefined }): Promise<IUserProps | null> {
        try {
            if (data.permissions) {
                await this.prisma.userPermission.deleteMany({ where: { userId: id } });
            }

            const updateData: any = {};
            if (data.firstName !== undefined) updateData.firstName = data.firstName;
            if (data.lastName !== undefined) updateData.lastName = data.lastName;
            if (data.role !== undefined) updateData.role = data.role as any;
            if (data.status !== undefined) updateData.status = data.status as any;
            if (data.accessSchedule !== undefined) updateData.accessSchedule = data.accessSchedule as any;
            if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
            if (data.coordinatorId !== undefined) updateData.coordinatorId = data.coordinatorId;
            if (data.password !== undefined && data.password.trim().length > 0) {
                updateData.password = data.password;
            }

            if (data.permissions && data.permissions.length > 0) {
                updateData.permissions = {
                    create: data.permissions.map((p) => ({
                        moduleKey: p.moduleKey,
                        level: p.level,
                    })),
                };
            }

            const user = await this.prisma.user.update({
                where: { id },
                data: updateData,
                include: { permissions: true },
            });

            const { password: _, ...rest } = user;
            return rest as unknown as IUserProps;
        } catch (e) {
            console.error(`Erro ao atualizar usuário: ${e}`);
            return null;
        }
    }

    public async updateUserStatus(id: string, status: UserStatus): Promise<boolean> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { status: status as any },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao alterar status do usuário: ${e}`);
            return false;
        }
    }
}
