import type { Request, Response } from "express";
import PrismaSinglentonConnection from "../../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export default class BannerTemplateController {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async create(req: Request, res: Response) {
        try {
            const { name, imageUrl, targetUrl } = req.body;
            if (!name || !imageUrl) {
                return res.status(400).json({ message: "Nome e URL da imagem são obrigatórios para o template." });
            }

            const template = await this.prisma.bannerTemplate.create({
                data: { name, imageUrl, targetUrl },
            });

            return res.status(201).json({ message: "Template criado com sucesso", data: template });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao criar template de banner." });
        }
    }

    public async getAll(req: Request, res: Response) {
        try {
            const templates = await this.prisma.bannerTemplate.findMany({
                orderBy: { createdAt: "desc" },
            });
            return res.status(200).json({ data: templates });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao listar templates." });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.prisma.bannerTemplate.delete({ where: { id } });
            return res.status(200).json({ message: "Template excluído com sucesso." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao excluir template." });
        }
    }
}
