import type { Request, Response } from "express";
import type DashboardGetterService from "./dashboardGetterService";
import DashboardGetterServiceImpl from "./dashboardGetterServiceImpl";

export default class DashboardGetterController {
    private service: DashboardGetterService;

    public constructor() {
        this.service = new DashboardGetterServiceImpl();
    }

    public async getMetrics(req: Request, res: Response) {
        try {
            const metrics = await this.service.getMetrics();
            return res.status(200).json({ data: metrics });
        } catch (e: any) {
            return res.status(500).json({ message: e.message || "Erro ao obter métricas do dashboard." });
        }
    }
}
