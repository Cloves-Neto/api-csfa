import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IAgendaProps, IAgendaCreateData } from "../../models/iAgendaProps";

export class AgendaCreatorRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async createEvent(data: IAgendaCreateData): Promise<IAgendaProps | null> {
        try {
            const event = await this.prisma.agendaEvent.create({
                data: {
                    title: data.title,
                    date: new Date(data.date),
                    time: data.time ?? null,
                    type: data.type as any,
                    status: (data.status as any) || "CONFIRMADO",
                    location: data.location ?? null,
                    description: data.description ?? null,
                },
            });
            return event as unknown as IAgendaProps;
        } catch (e) {
            console.error(`Erro ao criar evento: ${e}`);
            return null;
        }
    }
}
