import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IAgendaProps, IAgendaCreateData, EventStatus } from "../../models/iAgendaProps";

export class AgendaUpdaterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async updateEvent(id: string, data: Partial<IAgendaCreateData>): Promise<IAgendaProps | null> {
        try {
            const updateData: any = {};
            if (data.title !== undefined) updateData.title = data.title;
            if (data.date !== undefined) updateData.date = new Date(data.date);
            if (data.time !== undefined) updateData.time = data.time;
            if (data.type !== undefined) updateData.type = data.type as any;
            if (data.status !== undefined) updateData.status = data.status as any;
            if (data.location !== undefined) updateData.location = data.location;
            if (data.description !== undefined) updateData.description = data.description;

            const event = await this.prisma.agendaEvent.update({
                where: { id },
                data: updateData,
            });
            return event as unknown as IAgendaProps;
        } catch (e) {
            console.error(`Erro ao atualizar evento: ${e}`);
            return null;
        }
    }

    public async updateEventStatus(id: string, status: EventStatus): Promise<boolean> {
        try {
            await this.prisma.agendaEvent.update({
                where: { id },
                data: { status: status as any },
            });
            return true;
        } catch (e) {
            console.error(`Erro ao alterar status do evento: ${e}`);
            return false;
        }
    }
}
