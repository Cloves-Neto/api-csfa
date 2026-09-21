import { DashboardGetterRepository } from "../../../repositories/dashboard/dashboardGetterRepository";
import type { IDashboardStatsProps } from "../../../models/iDashboardProps";
import type DashboardGetterService from "./dashboardGetterService";

export default class DashboardGetterServiceImpl implements DashboardGetterService {
    private dashboardGetterRepository: DashboardGetterRepository;

    public constructor() {
        this.dashboardGetterRepository = new DashboardGetterRepository();
    }

    public async getMetrics(): Promise<IDashboardStatsProps> {
        return await this.dashboardGetterRepository.getMetrics();
    }
}
