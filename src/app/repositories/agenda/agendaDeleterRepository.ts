import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class AgendaDeleterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async deleteEvent(id: string): Promise<boolean> {
        try {
            await this.prisma.agendaEvent.delete({
                where: { id },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao excluir evento: ${e}`);
            return false;
        }
    }
}
