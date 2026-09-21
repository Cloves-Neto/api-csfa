import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IBannerProps, IBannerCreateData } from "../../models/iBannerProps";

export class BannerCreatorRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async createBanner(data: IBannerCreateData): Promise<IBannerProps | null> {
        try {
            const banner = await this.prisma.banner.create({
                data: {
                    title: data.title,
                    imageUrl: data.imageUrl,
                    targetUrl: data.targetUrl ?? null,
                    publishDate: data.publishDate ? new Date(data.publishDate) : null,
                    order: data.order ?? 0,
                    isActive: data.isActive ?? true,
                },
            });
            return banner as unknown as IBannerProps;
        } catch (e) {
            console.error(`Erro ao criar banner: ${e}`);
            return null;
        }
    }
}
