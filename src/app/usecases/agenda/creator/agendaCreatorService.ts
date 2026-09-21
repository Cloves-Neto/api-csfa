import type { IAgendaProps, IAgendaCreateData } from "../../../models/iAgendaProps";

export default interface AgendaCreatorService {
    create(data: IAgendaCreateData): Promise<IAgendaProps | null>;
}
