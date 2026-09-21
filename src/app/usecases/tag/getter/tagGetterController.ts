import type { Request, Response } from "express";
import type TagGetterService from "./tagGetterService";
import TagGetterServiceImpl from "./tagGetterServiceImpl";

export default class TagGetterController {
    private service: TagGetterService;

    public constructor() {
        this.service = new TagGetterServiceImpl();
    }

    public async getAll(req: Request, res: Response) {
        try {
            const tags = await this.service.getAll();
            return res.status(200).json({ data: tags });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao listar tags." });
        }
    }

    public async getById(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID ou slug da tag é obrigatório." });
            }

            const tag = await this.service.getById(id);
            if (tag) {
                return res.status(200).json({ data: tag });
            }
            return res.status(404).json({ message: "Tag não encontrada." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao buscar tag." });
        }
    }
}
