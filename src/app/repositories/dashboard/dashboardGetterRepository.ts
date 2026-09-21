import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IDashboardStatsProps } from "../../models/iDashboardProps";

export class DashboardGetterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async getMetrics(): Promise<IDashboardStatsProps> {
        try {
            const [
                totalPosts,
                publishedPosts,
                totalEvents,
                confirmedEvents,
                totalBanners,
                activeBanners,
                totalUsers,
                activeUsers,
                blockedUsers,
                totalSubmissions,
                pendingSubmissions,
            ] = await Promise.all([
                this.prisma.post.count(),
                this.prisma.post.count({ where: { published: true } }),
                this.prisma.agendaEvent.count(),
                this.prisma.agendaEvent.count({ where: { status: "CONFIRMADO" } }),
                this.prisma.banner.count(),
                this.prisma.banner.count({ where: { isActive: true } }),
                this.prisma.user.count(),
                this.prisma.user.count({ where: { status: "ACTIVE" } }),
                this.prisma.user.count({ where: { status: "BLOCKED" } }),
                this.prisma.contactSubmission.count(),
                this.prisma.contactSubmission.count({ where: { status: "PENDING" } }),
            ]);

            return {
                posts: {
                    total: totalPosts,
                    published: publishedPosts,
                    drafts: totalPosts - publishedPosts,
                },
                events: {
                    total: totalEvents,
                    confirmed: confirmedEvents,
                    upcoming: confirmedEvents,
                },
                banners: {
                    total: totalBanners,
                    active: activeBanners,
                    inactive: totalBanners - activeBanners,
                },
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    blocked: blockedUsers,
                },
                submissions: {
                    total: totalSubmissions,
                    pending: pendingSubmissions,
                },
            };
        } catch (e) {
            console.error(`Erro ao agregar métricas do dashboard: ${e}`);
            return {
                posts: { total: 0, published: 0, drafts: 0 },
                events: { total: 0, confirmed: 0, upcoming: 0 },
                banners: { total: 0, active: 0, inactive: 0 },
                users: { total: 0, active: 0, blocked: 0 },
                submissions: { total: 0, pending: 0 },
            };
        }
    }
}
