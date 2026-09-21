import express from "express";
import BannerGetterController from "../app/usecases/banner/getter/bannerGetterController";
import BannerCreatorController from "../app/usecases/banner/creator/bannerCreatorController";
import BannerUpdaterController from "../app/usecases/banner/updater/bannerUpdaterController";
import BannerDeleterController from "../app/usecases/banner/deleter/bannerDeleterController";
import BannerTemplateController from "../app/usecases/banner/template/BannerTemplateController";
import { authMiddleware, optionalAuthMiddleware } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";

const BannerRouter = express.Router();

const bannerGetterController = new BannerGetterController();
const bannerCreatorController = new BannerCreatorController();
const bannerUpdaterController = new BannerUpdaterController();
const bannerDeleterController = new BannerDeleterController();
const bannerTemplateController = new BannerTemplateController();

// Rotas Públicas (Leitura na Home)
BannerRouter.get("/", optionalAuthMiddleware as any, bannerGetterController.getAll.bind(bannerGetterController));
BannerRouter.get("/:id", optionalAuthMiddleware as any, bannerGetterController.getById.bind(bannerGetterController));

// Rotas Protegidas (CMS)
const bannerMgmtRoles = requireRoles("ADMIN", "COORDENACAO", "TI");
BannerRouter.post("/", authMiddleware as any, bannerMgmtRoles, bannerCreatorController.create.bind(bannerCreatorController));
BannerRouter.put("/:id", authMiddleware as any, bannerMgmtRoles, bannerUpdaterController.update.bind(bannerUpdaterController));
BannerRouter.patch("/:id/status", authMiddleware as any, bannerMgmtRoles, bannerUpdaterController.toggleStatus.bind(bannerUpdaterController));
BannerRouter.delete("/:id", authMiddleware as any, bannerMgmtRoles, bannerDeleterController.delete.bind(bannerDeleterController));

// Templates de Banner
BannerRouter.post("/templates", authMiddleware as any, bannerMgmtRoles, bannerTemplateController.create.bind(bannerTemplateController));
BannerRouter.get("/templates", authMiddleware as any, bannerMgmtRoles, bannerTemplateController.getAll.bind(bannerTemplateController));
BannerRouter.delete("/templates/:id", authMiddleware as any, bannerMgmtRoles, bannerTemplateController.delete.bind(bannerTemplateController));

export default BannerRouter;
