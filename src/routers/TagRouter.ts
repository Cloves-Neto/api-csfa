import express from "express";
import TagGetterController from "../app/usecases/tag/getter/tagGetterController";
import TagCreatorController from "../app/usecases/tag/creator/tagCreatorController";
import TagUpdaterController from "../app/usecases/tag/updater/tagUpdaterController";
import TagDeleterController from "../app/usecases/tag/deleter/tagDeleterController";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";

const TagRouter = express.Router();

const tagGetterController = new TagGetterController();
const tagCreatorController = new TagCreatorController();
const tagUpdaterController = new TagUpdaterController();
const tagDeleterController = new TagDeleterController();

// Rotas Públicas (Leitura)
TagRouter.get("/", tagGetterController.getAll.bind(tagGetterController));
TagRouter.get("/:id", tagGetterController.getById.bind(tagGetterController));

// Rotas Protegidas (CMS)
const tagMgmtRoles = requireRoles("ADMIN", "COORDENACAO", "TI");
TagRouter.post("/", authMiddleware as any, tagMgmtRoles, tagCreatorController.create.bind(tagCreatorController));
TagRouter.put("/:id", authMiddleware as any, tagMgmtRoles, tagUpdaterController.update.bind(tagUpdaterController));
TagRouter.delete("/:id", authMiddleware as any, tagMgmtRoles, tagDeleterController.delete.bind(tagDeleterController));

export default TagRouter;
