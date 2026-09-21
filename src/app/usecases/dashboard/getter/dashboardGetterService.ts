import type { IDashboardStatsProps } from "../../../models/iDashboardProps";

export default interface DashboardGetterService {
    getMetrics(): Promise<IDashboardStatsProps>;
}
