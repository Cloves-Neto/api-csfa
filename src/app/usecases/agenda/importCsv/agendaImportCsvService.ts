import { Readable } from "stream";
import csv from "csv-parser";
import { supabase } from "../../../../infrastructure/supabase/supabaseClient";
import PrismaSinglentonConnection from "../../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import crypto from "crypto";

export interface ImportCsvResult {
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
  supabaseBackupUrl?: string | undefined;
  errors?: string[] | undefined;
}

export class AgendaImportCsvService {
  private prisma = PrismaSinglentonConnection.getConnection();
  private calendarBucket = "csfa-calendar";

  /**
   * Faz o parse de CSV em stream de alta performance (suporta até 150MB sem estourar RAM),
   * salva cópia no Supabase Storage e insere os eventos no banco de dados.
   */
  async importCsv(file: Express.Multer.File): Promise<ImportCsvResult> {
    if (!file || !file.buffer) {
      throw new Error("Arquivo CSV não fornecido.");
    }

    // 1. Upload assíncrono de backup no Supabase Storage (Bucket: csfa-calendar)
    let supabaseBackupUrl: string | undefined;
    try {
      const randomHash = crypto.randomBytes(4).toString("hex");
      const filename = `import-${Date.now()}-${randomHash}.csv`;
      const { data, error } = await supabase.storage
        .from(this.calendarBucket)
        .upload(`uploads/${filename}`, file.buffer, {
          contentType: "text/csv",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from(this.calendarBucket)
          .getPublicUrl(data.path);
        supabaseBackupUrl = publicData?.publicUrl;
      }
    } catch (e) {
      console.warn("Aviso: Falha ao salvar backup no bucket csfa-calendar (continuando importação no banco):", e);
    }

    // 2. Stream Parse do CSV
    const rows: any[] = [];
    const errors: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(file.buffer);
      stream
        .pipe(
          csv({
            separator: ",",
            mapHeaders: ({ header }) =>
              header.trim().toLowerCase().replace(/["']/g, "").replace(/\s+/g, "_"),
          })
        )
        .on("data", (data) => rows.push(data))
        .on("error", (err) => reject(err))
        .on("end", () => resolve());
    });

    if (rows.length === 0) {
      throw new Error("O arquivo CSV está vazio ou os cabeçalhos estão incorretos.");
    }

    // 3. Normalização e Validação dos Registros
    const eventsToCreate: Array<{
      title: string;
      date: Date;
      time: string | null;
      type: "ACADEMICO" | "ESPORTIVO" | "REUNIAO" | "EVENTO" | "FERIADO";
      status: "CONFIRMADO" | "PENDENTE" | "CANCELADO";
      location: string | null;
      description: string | null;
    }> = [];

    const validTypes = ["ACADEMICO", "ESPORTIVO", "REUNIAO", "EVENTO", "FERIADO"];
    const validStatuses = ["CONFIRMADO", "PENDENTE", "CANCELADO"];

    const typeMapping: Record<string, "ACADEMICO" | "ESPORTIVO" | "REUNIAO" | "EVENTO" | "FERIADO"> = {
      academico: "ACADEMICO",
      acadêmico: "ACADEMICO",
      academic: "ACADEMICO",
      esportivo: "ESPORTIVO",
      esportes: "ESPORTIVO",
      sports: "ESPORTIVO",
      reuniao: "REUNIAO",
      reunião: "REUNIAO",
      institucional: "REUNIAO",
      evento: "EVENTO",
      eventos: "EVENTO",
      event: "EVENTO",
      feriado: "FERIADO",
      holiday: "FERIADO",
    };

    rows.forEach((row, index) => {
      const lineNum = index + 2;
      const title = row.title || row.titulo || row.nome || row.evento;
      const rawDate = row.date || row.data || row.data_inicio;

      if (!title || !rawDate) {
        errors.push(`Linha ${lineNum}: Título ou Data não informados.`);
        return;
      }

      // Tratamento flexível de data (YYYY-MM-DD ou DD/MM/YYYY)
      let parsedDate: Date;
      if (rawDate.includes("/")) {
        const [day, month, year] = rawDate.split("/").map(Number);
        parsedDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      } else {
        parsedDate = new Date(rawDate);
      }

      if (isNaN(parsedDate.getTime())) {
        errors.push(`Linha ${lineNum}: Formato de data inválido (${rawDate}).`);
        return;
      }

      const rawType = (row.type || row.tipo || row.categoria || "EVENTO").toLowerCase();
      const mappedType = typeMapping[rawType] || "EVENTO";

      const rawStatus = (row.status || row.situacao || "CONFIRMADO").toUpperCase();
      const finalStatus = validStatuses.includes(rawStatus)
        ? (rawStatus as "CONFIRMADO" | "PENDENTE" | "CANCELADO")
        : "CONFIRMADO";

      eventsToCreate.push({
        title: String(title).trim(),
        date: parsedDate,
        time: row.time || row.horario || row.hora || null,
        type: mappedType,
        status: finalStatus,
        location: row.location || row.local || row.localizacao || "Colégio São Francisco de Assis",
        description: row.description || row.descricao || row.detalhes || null,
      });
    });

    if (eventsToCreate.length === 0) {
      throw new Error(`Nenhum evento válido encontrado no CSV. Erros: ${errors.join(" | ")}`);
    }

    // 4. Inserção em Lote no PostgreSQL (Prisma createMany)
    const result = await this.prisma.agendaEvent.createMany({
      data: eventsToCreate,
      skipDuplicates: false,
    });

    return {
      totalProcessed: rows.length,
      totalImported: result.count,
      totalSkipped: rows.length - result.count,
      supabaseBackupUrl,
      errors: errors.length > 0 ? errors.slice(0, 15) : undefined,
    };
  }

  /**
   * Gera o conteúdo CSV do template modelo para download.
   */
  getTemplateCsv(): string {
    const headers = "title,date,time,type,status,location,description\n";
    const exampleRows = [
      'Início das Aulas do 1º Semestre,2026-02-02,07:30,ACADEMICO,CONFIRMADO,Salas de Aula,Recepção dos alunos e boas-vindas do ano letivo',
      'Reunião Geral de Pais e Mestres,2026-03-14,19:00,REUNIAO,CONFIRMADO,Auditório Central,Apresentação da equipe pedagógica e calendário escolar',
      'Torneio Esportivo Interclasses,2026-04-18,08:30 - 17:00,ESPORTIVO,CONFIRMADO,Complexo Esportivo,Competições de Futsal e Vôlei',
      'Feira de Ciências & Tecnologia CSFA,2026-05-23,09:00 - 16:00,EVENTO,CONFIRMADO,Pátio Central e Laboratórios,Exposição de projetos científicos dos estudantes',
      'Feriado Nacional - Independência,2026-09-07,Dia todo,FERIADO,CONFIRMADO,Não aplicável,Recesso escolar',
    ].join("\n");

    return headers + exampleRows;
  }
}

export const agendaImportCsvService = new AgendaImportCsvService();
