import { AgendaUpdaterRepository } from "../../../repositories/agenda/agendaUpdaterRepository";
import { AgendaGetterRepository } from "../../../repositories/agenda/agendaGetterRepository";
import type { IAgendaProps, IAgendaCreateData, EventStatus } from "../../../models/iAgendaProps";
import type AgendaUpdaterService from "./agendaUpdaterService";

export default class AgendaUpdaterServiceImpl implements AgendaUpdaterService {
    private agendaUpdaterRepository: AgendaUpdaterRepository;
    private agendaGetterRepository: AgendaGetterRepository;

    public constructor() {
        this.agendaUpdaterRepository = new AgendaUpdaterRepository();
        this.agendaGetterRepository = new AgendaGetterRepository();
    }

    public async update(id: string, data: Partial<IAgendaCreateData>): Promise<IAgendaProps | null> {
        const existing = await this.agendaGetterRepository.agendaGetById(id);
        if (!existing) {
            throw new Error("Evento não encontrado.");
        }
        return await this.agendaUpdaterRepository.updateEvent(id, data);
    }

    public async updateStatus(id: string, status: EventStatus): Promise<boolean> {
        const existing = await this.agendaGetterRepository.agendaGetById(id);
        if (!existing) {
            throw new Error("Evento não encontrado.");
        }
        return await this.agendaUpdaterRepository.updateEventStatus(id, status);
    }
}
