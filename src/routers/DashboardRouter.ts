import express from "express";
import DashboardGetterController from "../app/usecases/dashboard/getter/dashboardGetterController";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";

const DashboardRouter = express.Router();
const dashboardGetterController = new DashboardGetterController();

DashboardRouter.use(authMiddleware as any);
DashboardRouter.use(requireRoles("ADMIN", "COORDENACAO", "SECRETARIA", "TI", "PROFESSOR") as any);

DashboardRouter.get("/metrics", dashboardGetterController.getMetrics.bind(dashboardGetterController));

export default DashboardRouter;
