import { AgendaGetterRepository, type IFindAgendaFilters } from "../../../repositories/agenda/agendaGetterRepository";
import type { IAgendaProps } from "../../../models/iAgendaProps";
import type AgendaGetterService from "./agendaGetterService";

export default class AgendaGetterServiceImpl implements AgendaGetterService {
    private agendaGetterRepository: AgendaGetterRepository;

    public constructor() {
        this.agendaGetterRepository = new AgendaGetterRepository();
    }

    public async getAll(filters: IFindAgendaFilters = {}): Promise<IAgendaProps[]> {
        return await this.agendaGetterRepository.agendaGetAll(filters);
    }

    public async getById(id: string): Promise<IAgendaProps | null> {
        return await this.agendaGetterRepository.agendaGetById(id);
    }
}
