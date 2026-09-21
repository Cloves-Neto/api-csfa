import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IBannerProps, IBannerCreateData } from "../../models/iBannerProps";

export class BannerUpdaterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async updateBanner(id: string, data: Partial<IBannerCreateData>): Promise<IBannerProps | null> {
        try {
            const updateData: any = {};
            if (data.title !== undefined) updateData.title = data.title;
            if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
            if (data.targetUrl !== undefined) updateData.targetUrl = data.targetUrl;
            if (data.publishDate !== undefined) updateData.publishDate = data.publishDate ? new Date(data.publishDate) : null;
            if (data.order !== undefined) updateData.order = data.order;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;

            const banner = await this.prisma.banner.update({
                where: { id },
                data: updateData,
            });
            return banner as unknown as IBannerProps;
        } catch (e) {
            console.error(`Erro ao atualizar banner: ${e}`);
            return null;
        }
    }

    public async toggleBannerStatus(id: string): Promise<IBannerProps | null> {
        try {
            const current = await this.prisma.banner.findUnique({ where: { id } });
            if (!current) return null;

            const updated = await this.prisma.banner.update({
                where: { id },
                data: { isActive: !current.isActive },
            });
            return updated as unknown as IBannerProps;
        } catch (e) {
            console.error(`Erro ao alterar status do banner: ${e}`);
            return null;
        }
    }
}
