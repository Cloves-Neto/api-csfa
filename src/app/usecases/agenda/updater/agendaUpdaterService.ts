import type { IAgendaProps, IAgendaCreateData, EventStatus } from "../../../models/iAgendaProps";

export default interface AgendaUpdaterService {
    update(id: string, data: Partial<IAgendaCreateData>): Promise<IAgendaProps | null>;
    updateStatus(id: string, status: EventStatus): Promise<boolean>;
}
