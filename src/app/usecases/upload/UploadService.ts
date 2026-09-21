import { supabase } from "../../../infrastructure/supabase/supabaseClient";
import path from "path";
import crypto from "crypto";

export interface UploadFileOptions {
  file: Express.Multer.File;
  folder?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  mimetype: string;
  size: number;
}

export class UploadService {
  private defaultBucket = process.env.SUPABASE_BUCKET_NAME || "csfa-media";

  /**
   * Faz o upload do arquivo para o bucket do Supabase Storage e retorna a URL pública.
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const { file, folder = "geral" } = options;

    if (!file) {
      throw new Error("Nenhum arquivo fornecido para upload.");
    }

    // Sanitiza o nome original e gera um hash único para evitar colisão
    const ext = path.extname(file.originalname).toLowerCase();
    const originalBaseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 40);

    const randomHash = crypto.randomBytes(6).toString("hex");
    const filename = `${originalBaseName}-${Date.now()}-${randomHash}${ext}`;
    
    // Sanitiza o nome da pasta de destino
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
    const filePath = `${sanitizedFolder}/${filename}`;

    // Upload do Buffer direto no Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.defaultBucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Erro no Supabase Storage Upload:", error);
      throw new Error(`Falha ao salvar arquivo no Supabase: ${error.message}`);
    }

    // Recupera a URL pública do arquivo
    const { data: publicData } = supabase.storage
      .from(this.defaultBucket)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      path: data.path,
      filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Remove um arquivo do bucket do Supabase Storage.
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (!filePath) return false;

    const { error } = await supabase.storage
      .from(this.defaultBucket)
      .remove([filePath]);

    if (error) {
      console.error("Erro ao deletar arquivo no Supabase Storage:", error);
      return false;
    }

    return true;
  }
}

export const uploadService = new UploadService();
