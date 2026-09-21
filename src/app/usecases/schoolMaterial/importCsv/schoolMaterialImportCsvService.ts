import { Readable } from "stream";
import csv from "csv-parser";
import PrismaSinglentonConnection from "../../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export interface ImportSchoolMaterialCsvResult {
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
  errors?: string[] | undefined;
}

export class SchoolMaterialImportCsvService {
  private prisma = PrismaSinglentonConnection.getConnection();

  /**
   * Faz o parse de CSV em stream de alta performance (suporta grandes arquivos),
   * e insere os materiais no banco de dados.
   */
  async importCsv(file: Express.Multer.File): Promise<ImportSchoolMaterialCsvResult> {
    if (!file || !file.buffer) {
      throw new Error("Arquivo CSV não fornecido.");
    }

    // Stream Parse do CSV
    const rows: any[] = [];
    const errors: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(file.buffer);
      stream
        .pipe(
          csv({
            separator: ",",
            mapHeaders: ({ header }) => header.trim(),
          })
        )
        .on("data", (data) => rows.push(data))
        .on("error", (error) => {
          console.error("Erro no parse do CSV de materiais:", error);
          reject(new Error("Falha ao processar CSV. Verifique a formatação."));
        })
        .on("end", resolve);
    });

    if (rows.length === 0) {
      throw new Error("O arquivo CSV está vazio ou os headers não foram reconhecidos.");
    }

    let totalImported = 0;
    let totalSkipped = 0;

    const materialsToCreate: any[] = [];

    // Mapeamento e Validação
    for (const [index, row] of rows.entries()) {
      const lineNumber = index + 2; // +1 pro array 0-based, +1 pro header
      try {
        const { title, academicYear, segment, grade, fileUrl } = row;

        if (!title || !academicYear || !segment || !grade || !fileUrl) {
          errors.push(`Linha ${lineNumber}: Campos obrigatórios ausentes. É necessário preencher title, academicYear, segment, grade, fileUrl.`);
          totalSkipped++;
          continue;
        }

        materialsToCreate.push({
          title: String(title).trim(),
          academicYear: Number(academicYear),
          segment: String(segment).trim(),
          grade: String(grade).trim(),
          fileUrl: String(fileUrl).trim(),
          isActive: true,
        });

      } catch (err: any) {
        errors.push(`Linha ${lineNumber}: Erro inesperado - ${err.message}`);
        totalSkipped++;
      }
    }

    // Inserção em Lote (Batch Insert Prisma)
    if (materialsToCreate.length > 0) {
      try {
        const createResult = await this.prisma.schoolMaterial.createMany({
          data: materialsToCreate,
          skipDuplicates: false, // Caso tenha duplicação, ele insere mesmo assim para listas variadas
        });
        totalImported = createResult.count;
      } catch (err: any) {
        throw new Error(`Falha crítica na inserção no banco: ${err.message}`);
      }
    }

    return {
      totalProcessed: rows.length,
      totalImported,
      totalSkipped,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Retorna o conteúdo de um CSV modelo formatado (com aspas e BOM)
   */
  getTemplateCsv(): string {
    const headers = ["title", "academicYear", "segment", "grade", "fileUrl"];
    const examples = [
      ["Lista 1º Ano A", "2026", "FUNDAMENTAL_1", "1º Ano", "https://link-do-pdf.com/lista1.pdf"],
      ["Lista 2º Ano B", "2026", "FUNDAMENTAL_1", "2º Ano", "https://link-do-pdf.com/lista2.pdf"],
      ["Maternal II", "2026", "EDUCACAO_INFANTIL", "Maternal II", "https://link-do-pdf.com/lista3.pdf"],
    ];

    const formatRow = (cols: string[]) => cols.map((col) => `"${col}"`).join(",");
    
    return [
      formatRow(headers),
      ...examples.map(formatRow)
    ].join("\n");
  }
}

export const schoolMaterialImportCsvService = new SchoolMaterialImportCsvService();
