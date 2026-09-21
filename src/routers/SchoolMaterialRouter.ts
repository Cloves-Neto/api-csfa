import { Router } from "express";
import PrismaSinglentonConnection from "../infrastructure/database/prisma/prismaSinglentonConnecion";
import { authMiddleware, type CustomRequest } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";
import { AuditLogService } from "../app/services/AuditLogService";
import { uploadCalendar } from "../app/middlewares/uploadMiddleware";
import { schoolMaterialImportCsvController } from "../app/usecases/schoolMaterial/importCsv/schoolMaterialImportCsvController";

const prisma = PrismaSinglentonConnection.getConnection();

const schoolMaterialRouter = Router();

// Roles permitidas para gerenciar materiais
const schoolMaterialMgmtRoles = requireRoles("ADMIN", "COORDENACAO", "SECRETARIA", "TI");

// 📄 Download do Modelo CSV (Template)
schoolMaterialRouter.get("/template-csv", schoolMaterialImportCsvController.handleDownloadTemplate.bind(schoolMaterialImportCsvController));

// 📥 Importação de CSV em Massa
schoolMaterialRouter.post(
  "/import-csv",
  authMiddleware as any,
  schoolMaterialMgmtRoles,
  uploadCalendar.single("file"), // Reutiliza o middleware de memória da agenda
  schoolMaterialImportCsvController.handleImport.bind(schoolMaterialImportCsvController)
);

// Listagem pública para o site institucional
schoolMaterialRouter.get("/", async (req, res) => {
    try {
        const { academicYear, segment } = req.query;
        const where: any = { isActive: true };

        if (academicYear) {
            where.academicYear = Number(academicYear);
        }
        if (segment) {
            where.segment = segment as string;
        }

        const materials = await prisma.schoolMaterial.findMany({
            where,
            orderBy: [{ academicYear: "desc" }, { segment: "asc" }, { grade: "asc" }],
        });

        return res.json(materials);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar listas de materiais." });
    }
});

// Criar material (ADMIN, COORDENACAO, SECRETARIA)
schoolMaterialRouter.post("/", authMiddleware, requireRoles("ADMIN", "COORDENACAO", "SECRETARIA"), async (req: CustomRequest, res) => {
    try {
        const { title, academicYear, segment, grade, fileUrl } = req.body;

        if (!title || !academicYear || !segment || !grade || !fileUrl) {
            return res.status(400).json({ message: "Campos obrigatórios ausentes." });
        }

        const material = await prisma.schoolMaterial.create({
            data: {
                title,
                academicYear: Number(academicYear),
                segment,
                grade,
                fileUrl,
                isActive: true,
            },
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "CREATE_MATERIAL",
            module: "SYSTEM",
            details: `Lista de materiais cadastrada: ${title} (${grade} - ${academicYear})`,
            ipAddress: req.ip,
        });

        return res.status(201).json(material);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao cadastrar material escolar." });
    }
});

// Deletar material
schoolMaterialRouter.delete("/:id", authMiddleware, requireRoles("ADMIN", "COORDENACAO", "SECRETARIA"), async (req: CustomRequest, res) => {
    try {
        const id = String(req.params.id);
        await prisma.schoolMaterial.delete({
            where: { id },
        });

        await AuditLogService.log({
            userId: req.user.id,
            action: "DELETE_MATERIAL",
            module: "SYSTEM",
            details: `Lista de materiais removida: ${id}`,
            ipAddress: req.ip,
        });

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao remover material escolar." });
    }
});

export { schoolMaterialRouter };
