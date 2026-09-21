import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class TagDeleterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async deleteTag(id: string): Promise<boolean> {
        try {
            await this.prisma.tag.delete({
                where: { id },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao excluir tag: ${e}`);
            return false;
        }
    }
}
