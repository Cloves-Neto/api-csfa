import express from "express";
import AgendaGetterController from "../app/usecases/agenda/getter/agendaGetterController";
import AgendaCreatorController from "../app/usecases/agenda/creator/agendaCreatorController";
import AgendaUpdaterController from "../app/usecases/agenda/updater/agendaUpdaterController";
import AgendaDeleterController from "../app/usecases/agenda/deleter/agendaDeleterController";
import { agendaImportCsvController } from "../app/usecases/agenda/importCsv/agendaImportCsvController";
import { uploadCalendar } from "../app/middlewares/uploadMiddleware";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";

const AgendaRouter = express.Router();

const agendaGetterController = new AgendaGetterController();
const agendaCreatorController = new AgendaCreatorController();
const agendaUpdaterController = new AgendaUpdaterController();
const agendaDeleterController = new AgendaDeleterController();

// Roles permitidas para gerenciar a agenda
const agendaMgmtRoles = requireRoles("ADMIN", "COORDENACAO", "SECRETARIA", "TI");

// 📄 Download do Modelo CSV (Template)
AgendaRouter.get("/template-csv", agendaImportCsvController.handleDownloadTemplate.bind(agendaImportCsvController));

// 📥 Importação de CSV em Massa (Até 150MB com backup no bucket csfa-calendar)
AgendaRouter.post(
  "/import-csv",
  authMiddleware as any,
  agendaMgmtRoles,
  uploadCalendar.single("file"),
  agendaImportCsvController.handleImport.bind(agendaImportCsvController)
);

// Rotas Públicas (Leitura no Portal)
AgendaRouter.get("/", agendaGetterController.getAll.bind(agendaGetterController));
AgendaRouter.get("/:id", agendaGetterController.getById.bind(agendaGetterController));

// Rotas Protegidas (CMS)
AgendaRouter.post("/", authMiddleware as any, agendaMgmtRoles, agendaCreatorController.create.bind(agendaCreatorController));
AgendaRouter.put("/:id", authMiddleware as any, agendaMgmtRoles, agendaUpdaterController.update.bind(agendaUpdaterController));
AgendaRouter.patch("/:id/status", authMiddleware as any, agendaMgmtRoles, agendaUpdaterController.updateStatus.bind(agendaUpdaterController));
AgendaRouter.delete("/:id", authMiddleware as any, agendaMgmtRoles, agendaDeleterController.delete.bind(agendaDeleterController));

export default AgendaRouter;
