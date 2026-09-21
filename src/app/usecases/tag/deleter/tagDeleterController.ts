import type { Request, Response } from "express";
import type TagDeleterService from "./tagDeleterService";
import TagDeleterServiceImpl from "./tagDeleterServiceImpl";

export default class TagDeleterController {
    private service: TagDeleterService;

    public constructor() {
        this.service = new TagDeleterServiceImpl();
    }

    public async delete(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID da tag é obrigatório." });
            }

            const success = await this.service.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Tag não encontrada ou erro ao excluir." });
            }

            return res.status(200).json({ message: "Tag excluída com sucesso!" });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao excluir tag." });
        }
    }
}
