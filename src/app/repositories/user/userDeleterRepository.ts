import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class UserDeleterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async deleteUser(id: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao excluir usuário: ${e}`);
            return false;
        }
    }
}
