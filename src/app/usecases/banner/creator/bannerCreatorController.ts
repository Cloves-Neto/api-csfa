import type { Request, Response } from "express";
import type BannerCreatorService from "./bannerCreatorService";
import BannerCreatorServiceImpl from "./bannerCreatorServiceImpl";

export default class BannerCreatorController {
    private service: BannerCreatorService;

    public constructor() {
        this.service = new BannerCreatorServiceImpl();
    }

    public async create(req: Request, res: Response) {
        try {
            const { title, imageUrl, targetUrl, publishDate, order, isActive } = req.body;

            if (!title || !imageUrl) {
                return res.status(400).json({ message: "Título e URL da imagem são obrigatórios." });
            }

            const banner = await this.service.create({
                title,
                imageUrl,
                targetUrl,
                publishDate,
                order: Number(order) || 0,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            });

            if (banner) {
                const currentUserId = (req as any).user?.id;
                if (currentUserId) {
                    const { AuditLogService } = require("../../../../services/AuditLogService");
                    await AuditLogService.log({
                        userId: currentUserId,
                        action: "CREATE_BANNER",
                        module: "BANNERS",
                        details: `Banner "${title}" criado.`,
                        ipAddress: req.ip,
                    });
                }

                return res.status(201).json({
                    message: "Banner criado com sucesso!",
                    data: banner,
                });
            }
            return res.status(400).json({ message: "Falha ao criar banner." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao criar banner." });
        }
    }
}
