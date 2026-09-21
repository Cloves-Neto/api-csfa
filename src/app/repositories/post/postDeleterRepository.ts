import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class PostDeleterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async deletePost(id: string): Promise<boolean> {
        try {
            await this.prisma.post.delete({
                where: { id },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao excluir post: ${e}`);
            return false;
        }
    }
}
