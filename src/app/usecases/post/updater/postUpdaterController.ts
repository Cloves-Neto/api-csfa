import type { Request, Response } from "express";
import type PostUpdaterService from "./postUpdaterService";
import PostUpdaterServiceImpl from "./PostUpdaterServiceImpl";

export default class PostUpdaterController {
    private service: PostUpdaterService;

    public constructor() {
        this.service = new PostUpdaterServiceImpl();
    }

    public async update(req: Request, res: Response) {
        try {
            const id = String(req.params.id || req.params.postId || "");
            if (!id) {
                return res.status(400).json({ message: "ID do post é obrigatório." });
            }

            const { title, content, slug, excerpt, coverImageId, isEvent, published, tagIds } = req.body;

            const updated = await this.service.update(id, {
                title,
                content,
                slug,
                excerpt,
                coverImageId,
                isEvent,
                published,
                tagIds,
            });

            return res.status(200).json({
                message: "Postagem atualizada com sucesso!",
                data: updated,
            });
        } catch (e: any) {
            const statusCode = e.message.includes("não encontrado") ? 404 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao atualizar post." });
        }
    }

    public async togglePublish(req: Request, res: Response) {
        try {
            const id = String(req.params.id || req.params.postId || "");
            if (!id) {
                return res.status(400).json({ message: "ID do post é obrigatório." });
            }

            const updated = await this.service.togglePublish(id);
            if (!updated) {
                return res.status(404).json({ message: "Post não encontrado." });
            }

            return res.status(200).json({
                message: `Postagem ${updated.published ? "publicada" : "despublicada"} com sucesso!`,
                data: updated,
            });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao alternar publicação." });
        }
    }
}
