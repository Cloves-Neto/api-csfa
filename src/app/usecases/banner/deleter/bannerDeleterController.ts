import type { Request, Response } from "express";
import type BannerDeleterService from "./bannerDeleterService";
import BannerDeleterServiceImpl from "./bannerDeleterServiceImpl";

export default class BannerDeleterController {
    private service: BannerDeleterService;

    public constructor() {
        this.service = new BannerDeleterServiceImpl();
    }

    public async delete(req: Request, res: Response) {
        try {
            const id = String(req.params.id || "");
            if (!id) {
                return res.status(400).json({ message: "ID do banner é obrigatório." });
            }

            const success = await this.service.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Banner não encontrado ou erro ao excluir." });
            }

            return res.status(200).json({ message: "Banner excluído com sucesso!" });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao excluir banner." });
        }
    }
}
