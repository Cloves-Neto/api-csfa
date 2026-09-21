import type { IAgendaProps } from "../../../models/iAgendaProps";
import type { IFindAgendaFilters } from "../../../repositories/agenda/agendaGetterRepository";

export default interface AgendaGetterService {
    getAll(filters?: IFindAgendaFilters): Promise<IAgendaProps[]>;
    getById(id: string): Promise<IAgendaProps | null>;
}
