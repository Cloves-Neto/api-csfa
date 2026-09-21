import type { Request, Response } from "express";
import type PostGetterService from "./postGetterService";
import PostGetterServiceImpl from "./postGetterServiceImpl";

export default class PostGetterController {
    private service: PostGetterService;

    public constructor() {
        this.service = new PostGetterServiceImpl();
    }

    public async getAll(req: any, res: Response) {
        try {
            const { search, status, page, limit } = req.query;

            let finalStatus = status ? String(status) : undefined;
            // Segurança E2E: Se não estiver logado, ou não for perfil administrativo, força "published"
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "COORDENACAO" && req.user.role !== "TI")) {
                finalStatus = "published";
            }

            const result = await this.service.getAll({
                search: search ? String(search) : undefined,
                status: finalStatus as any,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
            });

            return res.status(200).json({
                data: result.posts,
                meta: result.meta,
            });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao buscar posts." });
        }
    }

    public async getById(req: any, res: Response) {
        try {
            const postId = String(req.params.id || req.params.postId || "");
            if (!postId) {
                return res.status(400).json({ message: "ID ou slug do post é obrigatório." });
            }

            const post = await this.service.getById(postId);
            if (post) {
                // Segurança E2E: Impede acesso direto a postagens não publicadas se não estiver logado ou não for admin/coord
                if (!post.published) {
                    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "COORDENACAO" && req.user.role !== "TI" && req.user.id !== post.authorId)) {
                        return res.status(404).json({ message: "Post não encontrado." });
                    }
                }
                return res.status(200).json({ data: post });
            }
            return res.status(404).json({ message: "Post não encontrado." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao buscar post." });
        }
    }
}