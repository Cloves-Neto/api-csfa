import type { Request, Response } from "express";
import type BannerUpdaterService from "./bannerUpdaterService";
import BannerUpdaterServiceImpl from "./bannerUpdaterServiceImpl";

export default class BannerUpdaterController {
    private service: BannerUpdaterService;

    public constructor() {
        this.service = new BannerUpdaterServiceImpl();
    }

    public async update(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do banner é obrigatório." });
            }

            const { title, imageUrl, targetUrl, publishDate, order, isActive } = req.body;

            const updatePayload: any = {
                title,
                imageUrl,
                targetUrl,
                publishDate,
            };
            if (order !== undefined) updatePayload.order = Number(order);
            if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);

            const updated = await this.service.update(id, updatePayload);

            return res.status(200).json({
                message: "Banner atualizado com sucesso!",
                data: updated,
            });
        } catch (e: any) {
            const statusCode = e.message.includes("não encontrado") ? 404 : 500;
            return res.status(statusCode).json({ message: e.message || "Erro ao atualizar banner." });
        }
    }

    public async toggleStatus(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do banner é obrigatório." });
            }

            const updated = await this.service.toggleStatus(id);
            if (!updated) {
                return res.status(404).json({ message: "Banner não encontrado." });
            }

            const currentUserId = (req as any).user?.id;
            if (currentUserId) {
                const { AuditLogService } = require("../../../../services/AuditLogService");
                await AuditLogService.log({
                    userId: currentUserId,
                    action: "UPDATE_BANNER_STATUS",
                    module: "BANNERS",
                    details: `Banner ID ${id} foi ${updated.isActive ? "ativado" : "desativado"}.`,
                    ipAddress: req.ip,
                });
            }

            return res.status(200).json({
                message: `Banner ${updated.isActive ? "ativado" : "desativado"} com sucesso!`,
                data: updated,
            });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao alternar status do banner." });
        }
    }
}
