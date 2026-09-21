import type { Request, Response } from "express";
import type AgendaUpdaterService from "./agendaUpdaterService";
import AgendaUpdaterServiceImpl from "./agendaUpdaterServiceImpl";
import type { EventStatus } from "../../../models/iAgendaProps";

export default class AgendaUpdaterController {
    private service: AgendaUpdaterService;

    public constructor() {
        this.service = new AgendaUpdaterServiceImpl();
    }

    public async update(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do evento é obrigatório." });
            }

            const { title, date, time, type, status, location, description } = req.body;

            const updatePayload: any = {
                title,
                time,
                type,
                status,
                location,
                description,
            };
            if (date) {
                updatePayload.date = new Date(date);
            }

            const updated = await this.service.update(id, updatePayload);

            return res.status(200).json({
                message: "Evento atualizado com sucesso!",
                data: updated,
            });
        } catch (e: any) {
            const statusCode = e.message.includes("não encontrado") ? 404 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao atualizar evento." });
        }
    }

    public async updateStatus(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            const status = req.body.status as EventStatus;

            if (!id || !status) {
                return res.status(400).json({ message: "ID e status são obrigatórios." });
            }

            const success = await this.service.updateStatus(id, status);
            if (!success) {
                return res.status(404).json({ message: "Evento não encontrado ou erro ao alterar status." });
            }

            return res.status(200).json({
                message: `Status do evento atualizado para ${status}.`,
            });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao alterar status do evento." });
        }
    }
}
