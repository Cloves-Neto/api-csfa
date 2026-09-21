import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IBannerProps } from "../../models/iBannerProps";

export class BannerGetterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async bannersGetAll(filters?: { isActive?: boolean }): Promise<IBannerProps[]> {
        try {
            const where: any = {};
            if (filters?.isActive !== undefined) {
                where.isActive = filters.isActive;
            }

            const banners = await this.prisma.banner.findMany({
                where,
                orderBy: { order: "asc" },
            });
            return banners as unknown as IBannerProps[];
        } catch (e) {
            console.error(`Erro ao listar banners: ${e}`);
            return [];
        }
    }

    public async bannersGetById(id: string): Promise<IBannerProps | null> {
        try {
            const banner = await this.prisma.banner.findUnique({
                where: { id },
            });
            return (banner as unknown as IBannerProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar banner por id: ${e}`);
            return null;
        }
    }
}
