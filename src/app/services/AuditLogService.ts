import PrismaSinglentonConnection from "../../infrastructure/database/prisma/prismaSinglentonConnecion";

export interface LogParams {
    userId?: string | undefined;
    action: string;
    module: "AUTH" | "POSTS" | "BANNERS" | "AGENDA" | "USERS" | "NOTIFICATIONS" | "PERMISSIONS" | "SYSTEM";
    details?: string | undefined;
    ipAddress?: string | undefined;
}

export class AuditLogService {
    private static readonly prisma = PrismaSinglentonConnection.getConnection();

    static async log(params: LogParams) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    userId: params.userId ?? null,
                    action: params.action,
                    module: params.module,
                    details: params.details ?? null,
                    ipAddress: params.ipAddress ?? null,
                },
            });
        } catch (error) {
            console.error("[AuditLogService] Erro ao gravar log de auditoria:", error);
        }
    }

    static async list(params: { limit?: number; page?: number; module?: string; action?: string }) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (params.module) where.module = params.module;
        if (params.action) where.action = params.action;

        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
