import type { Request, Response } from "express";
import type TagUpdaterService from "./tagUpdaterService";
import TagUpdaterServiceImpl from "./tagUpdaterServiceImpl";

export default class TagUpdaterController {
    private service: TagUpdaterService;

    public constructor() {
        this.service = new TagUpdaterServiceImpl();
    }

    public async update(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID da tag é obrigatório." });
            }

            const { name, slug, color } = req.body;

            const updated = await this.service.update(id, {
                name,
                slug,
                color,
            });

            return res.status(200).json({
                message: "Tag atualizada com sucesso!",
                data: updated,
            });
        } catch (e: any) {
            const statusCode = e.message.includes("não encontrada") ? 404 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao atualizar tag." });
        }
    }
}
