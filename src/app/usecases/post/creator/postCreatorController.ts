import type { Request, Response } from "express";
import type PostCreatorService from "./postCreatorService";
import PostCreatorServiceImpl from "./PostCreatorServiceImpl";
import type { CustomRequest } from "../../../middlewares/authMiddleware";

export default class PostCreatorController {
    private service: PostCreatorService;

    public constructor() {
        this.service = new PostCreatorServiceImpl();
    }

    public async create(req: CustomRequest, res: Response) {
        try {
            const { title, content, slug, excerpt, coverImageId, isEvent, published, tagIds } = req.body;

            if (!title || !content) {
                return res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
            }

            const authorId = req.user?.id || req.body.authorId;
            if (!authorId) {
                return res.status(400).json({ message: "Autor é obrigatório." });
            }

            const post = await this.service.create({
                title,
                content,
                slug,
                excerpt: excerpt ?? null,
                coverImageId: coverImageId ?? null,
                isEvent: Boolean(isEvent),
                authorId,
                published: Boolean(published),
                tagIds,
            });

            if (post) {
                return res.status(201).json({
                    message: "Postagem criada com sucesso!",
                    data: post,
                });
            }
            return res.status(400).json({ message: "Falha ao criar postagem." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro interno ao criar postagem." });
        }
    }
}
