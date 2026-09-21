import PrismaSinglentonConnection from "../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class NotificationService {
    private static readonly prisma = PrismaSinglentonConnection.getConnection();

    static async listForUser(userId: string) {
        // Obter o role do usuário para verificar targetRole
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        const userRole = user?.role || "PROFESSOR";

        const notifications = await this.prisma.notification.findMany({
            where: {
                OR: [
                    { targetUserId: userId },
                    { targetRole: userRole },
                    { isGlobal: true },
                ],
            },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                reads: {
                    where: { userId },
                    select: { id: true }
                }
            },
        });

        // Mapear o isRead dinamicamente baseado na tabela de reads
        return notifications.map(notif => {
            const isRead = notif.reads.length > 0;
            const { reads, ...rest } = notif;
            return {
                ...rest,
                isRead
            };
        });
    }

    static async markAsRead(notificationId: string, userId: string) {
        // Usa upsert para não dar erro se já existir
        return await this.prisma.notificationRead.upsert({
            where: {
                notificationId_userId: { notificationId, userId }
            },
            update: {},
            create: {
                notificationId,
                userId
            }
        });
    }

    static async markAllAsRead(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        const userRole = user?.role || "PROFESSOR";

        // Buscar todas as notificações aplicáveis a esse usuário
        const unreadNotifs = await this.prisma.notification.findMany({
            where: {
                OR: [
                    { targetUserId: userId },
                    { targetRole: userRole },
                    { isGlobal: true },
                ],
                NOT: {
                    reads: {
                        some: { userId }
                    }
                }
            },
            select: { id: true }
        });

        // Inserir na tabela NotificationRead
        if (unreadNotifs.length > 0) {
            await this.prisma.notificationRead.createMany({
                data: unreadNotifs.map(n => ({
                    notificationId: n.id,
                    userId
                })),
                skipDuplicates: true,
            });
        }
        return { success: true };
    }

    static async create(data: {
        title: string;
        message: string;
        type?: "INFO" | "WARNING" | "SUCCESS" | "DANGER";
        targetUserId?: string | null;
        targetRole?: string | null;
        isGlobal?: boolean;
        senderId: string;
        actionUrl?: string;
        attachmentUrl?: string;
        attachmentType?: string;
    }) {
        return await this.prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type || "INFO",
                targetUserId: data.targetUserId || null,
                targetRole: data.targetRole || null,
                isGlobal: data.isGlobal || false,
                senderId: data.senderId,
                actionUrl: data.actionUrl ?? null,
                attachmentUrl: data.attachmentUrl ?? null,
                attachmentType: data.attachmentType ?? null,
            },
        });
    }

    static async listSent(senderId: string, isAdmin: boolean) {
        const where = isAdmin ? {} : { senderId };
        return await this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                targetUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    static async delete(id: string) {
        return await this.prisma.notification.delete({
            where: { id }
        });
    }
}
