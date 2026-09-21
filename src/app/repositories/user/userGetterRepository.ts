import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IUserProps, UserRole, UserStatus } from "../../models/iUserProps";

export interface IFindUsersFilters {
    search?: string | undefined;
    role?: UserRole | undefined;
    status?: UserStatus | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

export interface IPaginatedUsersResult {
    users: IUserProps[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class UserGetterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async usersGetAll(filters: IFindUsersFilters = {}): Promise<IPaginatedUsersResult> {
        try {
            const page = filters.page && filters.page > 0 ? Number(filters.page) : 1;
            const limit = filters.limit && filters.limit > 0 ? Number(filters.limit) : 10;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (filters.search) {
                const term = filters.search.trim();
                where.OR = [
                    { firstName: { contains: term, mode: "insensitive" } },
                    { lastName: { contains: term, mode: "insensitive" } },
                    { email: { contains: term, mode: "insensitive" } },
                ];
            }

            if (filters.role) {
                where.role = filters.role;
            }

            if (filters.status) {
                where.status = filters.status;
            }

            const [total, rawUsers] = await Promise.all([
                this.prisma.user.count({ where }),
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        permissions: true,
                    },
                }),
            ]);

            const users = rawUsers.map((u) => {
                const { password: _, ...rest } = u;
                return rest as unknown as IUserProps;
            });

            return {
                users,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit) || 1,
                },
            };
        } catch (e) {
            console.error(`Erro ao listar usuários: ${e}`);
            return {
                users: [],
                meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
            };
        }
    }

    public async usersGetById(id: string): Promise<IUserProps | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: { permissions: true },
            });
            if (!user) return null;
            const { password: _, ...rest } = user;
            return rest as unknown as IUserProps;
        } catch (e) {
            console.error(`Erro ao buscar usuário por id: ${e}`);
            return null;
        }
    }

    public async usersGetByEmail(email: string): Promise<IUserProps | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
                include: { permissions: true },
            });
            return (user as unknown as IUserProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar usuário por email: ${e}`);
            return null;
        }
    }
}
