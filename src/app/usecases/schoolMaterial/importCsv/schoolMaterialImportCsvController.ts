import { Request, Response } from "express";
import { schoolMaterialImportCsvService } from "./schoolMaterialImportCsvService";

export class SchoolMaterialImportCsvController {
  /**
   * POST /school-materials/import-csv
   * Recebe arquivo CSV (multipart/form-data) e insere materiais escolares na base.
   */
  async handleImport(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo CSV enviado no campo 'file'.",
        });
      }

      const result = await schoolMaterialImportCsvService.importCsv(req.file);

      return res.status(201).json({
        success: true,
        message: `${result.totalImported} materiais escolares importados com sucesso!`,
        data: result,
      });
    } catch (error: any) {
      console.error("Erro na importação de CSV de materiais:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao processar arquivo CSV.",
      });
    }
  }

  /**
   * GET /school-materials/template-csv
   * Faz o download do arquivo modelo CSV com exemplos formatados.
   */
  async handleDownloadTemplate(_req: Request, res: Response): Promise<void> {
    const csvContent = schoolMaterialImportCsvService.getTemplateCsv();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="modelo_materiais_csfa.csv"');
    res.status(200).send("\uFEFF" + csvContent); // \uFEFF adiciona UTF-8 BOM para abrir perfeitamente no Excel
  }
}

export const schoolMaterialImportCsvController = new SchoolMaterialImportCsvController();
