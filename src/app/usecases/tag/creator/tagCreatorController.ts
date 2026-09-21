import type { Request, Response } from "express";
import type TagCreatorService from "./tagCreatorService";
import TagCreatorServiceImpl from "./tagCreatorServiceImpl";

export default class TagCreatorController {
    private service: TagCreatorService;

    public constructor() {
        this.service = new TagCreatorServiceImpl();
    }

    public async create(req: Request, res: Response) {
        try {
            const { name, slug, color } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Nome da tag é obrigatório." });
            }

            const tag = await this.service.create({
                name,
                slug,
                color: color || "#44abff",
            });

            if (tag) {
                return res.status(201).json({
                    message: "Tag criada com sucesso!",
                    data: tag,
                });
            }
            return res.status(400).json({ message: "Falha ao criar tag." });
        } catch (e: any) {
            const statusCode = e.message.includes("Já existe") ? 409 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao criar tag." });
        }
    }
}
