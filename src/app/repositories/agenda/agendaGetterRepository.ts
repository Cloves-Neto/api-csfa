import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IAgendaProps, EventType, EventStatus } from "../../models/iAgendaProps";

export interface IFindAgendaFilters {
    search?: string | undefined;
    type?: EventType | undefined;
    status?: EventStatus | undefined;
}

export class AgendaGetterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async agendaGetAll(filters: IFindAgendaFilters = {}): Promise<IAgendaProps[]> {
        try {
            const where: any = {};

            if (filters.search) {
                const term = filters.search.trim();
                where.OR = [
                    { title: { contains: term, mode: "insensitive" } },
                    { location: { contains: term, mode: "insensitive" } },
                    { description: { contains: term, mode: "insensitive" } },
                ];
            }

            if (filters.type) {
                where.type = filters.type;
            }

            if (filters.status) {
                where.status = filters.status;
            }

            const events = await this.prisma.agendaEvent.findMany({
                where,
                orderBy: { date: "asc" },
            });
            return events as unknown as IAgendaProps[];
        } catch (e) {
            console.error(`Erro ao listar eventos: ${e}`);
            return [];
        }
    }

    public async agendaGetById(id: string): Promise<IAgendaProps | null> {
        try {
            const event = await this.prisma.agendaEvent.findUnique({
                where: { id },
            });
            return (event as unknown as IAgendaProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar evento por id: ${e}`);
            return null;
        }
    }
}
