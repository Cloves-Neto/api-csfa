import type { Request, Response } from "express";
import type PostDeleterService from "./postDeleterService";
import PostDeleterServiceImpl from "./PostDeleterServiceImpl";

export default class PostDeleterController {
    private service: PostDeleterService;

    public constructor() {
        this.service = new PostDeleterServiceImpl();
    }

    public async delete(req: Request, res: Response) {
        try {
            const id = String(req.params.id || req.params.postId || "");
            if (!id) {
                return res.status(400).json({ message: "ID do post é obrigatório." });
            }

            const success = await this.service.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Post não encontrado ou erro ao excluir." });
            }

            return res.status(200).json({ message: "Postagem excluída com sucesso!" });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao excluir post." });
        }
    }
}
