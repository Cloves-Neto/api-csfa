import { Router } from "express";
import { authMiddleware, type CustomRequest } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";
import { AuditLogService } from "../app/services/AuditLogService";

const logRouter = Router();

// Apenas ADMIN tem acesso à rota de logs
logRouter.get("/", authMiddleware, requireRoles("ADMIN"), async (req: CustomRequest, res) => {
    try {
        const { limit, page, module: mod, action } = req.query;
        const logs = await AuditLogService.list({
            limit: limit ? Number(limit) : 20,
            page: page ? Number(page) : 1,
            module: mod as string,
            action: action as string,
        });

        return res.json(logs);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar logs de auditoria." });
    }
});

export { logRouter };
