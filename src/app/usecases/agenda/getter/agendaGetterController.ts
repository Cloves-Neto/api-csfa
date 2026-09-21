import type { Request, Response } from "express";
import type AgendaGetterService from "./agendaGetterService";
import AgendaGetterServiceImpl from "./agendaGetterServiceImpl";
import type { EventType, EventStatus } from "../../../models/iAgendaProps";

export default class AgendaGetterController {
    private service: AgendaGetterService;

    public constructor() {
        this.service = new AgendaGetterServiceImpl();
    }

    public async getAll(req: Request, res: Response) {
        try {
            const { search, type, status } = req.query;

            const events = await this.service.getAll({
                search: search ? String(search) : undefined,
                type: type ? (String(type).toUpperCase() as EventType) : undefined,
                status: status ? (String(status).toUpperCase() as EventStatus) : undefined,
            });

            return res.status(200).json({ data: events });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao listar eventos de agenda." });
        }
    }

    public async getById(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do evento é obrigatório." });
            }

            const event = await this.service.getById(id);
            if (event) {
                return res.status(200).json({ data: event });
            }
            return res.status(404).json({ message: "Evento não encontrado." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao buscar evento." });
        }
    }
}
