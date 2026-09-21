import type { Request, Response } from "express";
import type AgendaCreatorService from "./agendaCreatorService";
import AgendaCreatorServiceImpl from "./agendaCreatorServiceImpl";

export default class AgendaCreatorController {
    private service: AgendaCreatorService;

    public constructor() {
        this.service = new AgendaCreatorServiceImpl();
    }

    public async create(req: Request, res: Response) {
        try {
            const { title, date, time, type, status, location, description } = req.body;

            if (!title || !date) {
                return res.status(400).json({ message: "Título e data são obrigatórios." });
            }

            const event = await this.service.create({
                title,
                date,
                time,
                type: type || "EVENTO",
                status: status || "CONFIRMADO",
                location,
                description,
            });

            if (event) {
                return res.status(201).json({
                    message: "Evento criado com sucesso!",
                    data: event,
                });
            }
            return res.status(400).json({ message: "Falha ao criar evento." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao criar evento." });
        }
    }
}
