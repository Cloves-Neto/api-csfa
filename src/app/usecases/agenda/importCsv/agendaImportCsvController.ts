import { Request, Response } from "express";
import { agendaImportCsvService } from "./agendaImportCsvService";

export class AgendaImportCsvController {
  /**
   * POST /agenda/import-csv
   * Recebe arquivo CSV (até 150MB) e insere eventos na base.
   */
  async handleImport(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo CSV enviado no campo 'file'.",
        });
      }

      const result = await agendaImportCsvService.importCsv(req.file);

      return res.status(201).json({
        success: true,
        message: `${result.totalImported} eventos importados com sucesso para a agenda!`,
        data: result,
      });
    } catch (error: any) {
      console.error("Erro na importação de CSV da agenda:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao processar arquivo CSV.",
      });
    }
  }

  /**
   * GET /agenda/template-csv
   * Faz o download do arquivo modelo CSV com exemplos formatados.
   */
  async handleDownloadTemplate(_req: Request, res: Response): Promise<void> {
    const csvContent = agendaImportCsvService.getTemplateCsv();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="modelo_agenda_csfa.csv"');
    res.status(200).send("\uFEFF" + csvContent); // \uFEFF adiciona UTF-8 BOM para abrir perfeitamente no Excel
  }
}

export const agendaImportCsvController = new AgendaImportCsvController();
