import type { Request, Response } from "express";
import type BannerGetterService from "./bannerGetterService";
import BannerGetterServiceImpl from "./bannerGetterServiceImpl";

export default class BannerGetterController {
    private service: BannerGetterService;

    public constructor() {
        this.service = new BannerGetterServiceImpl();
    }

    public async getAll(req: any, res: Response) {
        try {
            const filters: any = {};
            // Segurança E2E: Se não for CMS, forçar isActive = true
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "COORDENACAO" && req.user.role !== "TI")) {
                filters.isActive = true;
            }
            const banners = await this.service.getAll(filters);
            return res.status(200).json({ data: banners });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao listar banners." });
        }
    }

    public async getById(req: any, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do banner é obrigatório." });
            }

            const banner = await this.service.getById(id);
            if (banner) {
                // Segurança E2E
                if (!banner.isActive) {
                    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "COORDENACAO" && req.user.role !== "TI")) {
                        return res.status(404).json({ message: "Banner não encontrado." });
                    }
                }
                return res.status(200).json({ data: banner });
            }
            return res.status(404).json({ message: "Banner não encontrado." });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao buscar banner." });
        }
    }
}
