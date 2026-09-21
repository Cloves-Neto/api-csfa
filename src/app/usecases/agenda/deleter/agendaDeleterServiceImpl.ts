import { AgendaDeleterRepository } from "../../../repositories/agenda/agendaDeleterRepository";
import type AgendaDeleterService from "./agendaDeleterService";

export default class AgendaDeleterServiceImpl implements AgendaDeleterService {
    private agendaDeleterRepository: AgendaDeleterRepository;

    public constructor() {
        this.agendaDeleterRepository = new AgendaDeleterRepository();
    }

    public async delete(id: string): Promise<boolean> {
        return await this.agendaDeleterRepository.deleteEvent(id);
    }
}
