import type { Request, Response } from "express";
import type AgendaDeleterService from "./agendaDeleterService";
import AgendaDeleterServiceImpl from "./agendaDeleterServiceImpl";

export default class AgendaDeleterController {
    private service: AgendaDeleterService;

    public constructor() {
        this.service = new AgendaDeleterServiceImpl();
    }

    public async delete(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do evento é obrigatório." });
            }

            const success = await this.service.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Evento não encontrado ou erro ao excluir." });
            }

            return res.status(200).json({ message: "Evento excluído com sucesso!" });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao excluir evento." });
        }
    }
}
