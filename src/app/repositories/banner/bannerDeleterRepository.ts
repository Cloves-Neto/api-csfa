import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class BannerDeleterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async deleteBanner(id: string): Promise<boolean> {
        try {
            await this.prisma.banner.delete({
                where: { id },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao excluir banner: ${e}`);
            return false;
        }
    }
}
