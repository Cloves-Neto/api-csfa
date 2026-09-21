import { AgendaCreatorRepository } from "../../../repositories/agenda/agendaCreatorRepository";
import type { IAgendaProps, IAgendaCreateData } from "../../../models/iAgendaProps";
import type AgendaCreatorService from "./agendaCreatorService";

export default class AgendaCreatorServiceImpl implements AgendaCreatorService {
    private agendaCreatorRepository: AgendaCreatorRepository;

    public constructor() {
        this.agendaCreatorRepository = new AgendaCreatorRepository();
    }

    public async create(data: IAgendaCreateData): Promise<IAgendaProps | null> {
        return await this.agendaCreatorRepository.createEvent(data);
    }
}
