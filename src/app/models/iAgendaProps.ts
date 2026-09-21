export type EventType = "ACADEMICO" | "ESPORTIVO" | "REUNIAO" | "EVENTO" | "FERIADO";
export type EventStatus = "CONFIRMADO" | "PENDENTE" | "CANCELADO";

export interface IAgendaProps {
    id: string;
    title: string;
    date: Date | string;
    time?: string | null;
    type: EventType;
    status: EventStatus;
    location?: string | null;
    description?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type IAgendaCreateData = Omit<IAgendaProps, "id" | "createdAt" | "updatedAt">;
