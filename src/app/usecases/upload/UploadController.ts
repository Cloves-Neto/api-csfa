import { Request, Response } from "express";
import { uploadService } from "./UploadService";

export class UploadController {
  /**
   * Endpoint genérico de upload
   * POST /upload
   * Body FormData: file (arquivo), folder (opcional: "banners", "posts", "documentos", etc.)
   */
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo enviado no campo 'file'.",
        });
      }

      const folder = (req.body.folder as string) || "geral";

      const result = await uploadService.uploadFile({
        file: req.file,
        folder,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Erro no UploadController:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro interno ao processar upload.",
      });
    }
  }

  /**
   * Endpoint específico para upload de Banners
   * POST /upload/banner
   */
  async handleBanner(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhum banner enviado no campo 'file'.",
        });
      }

      const result = await uploadService.uploadFile({
        file: req.file,
        folder: "banners",
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Erro no UploadController (Banner):", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro interno ao processar upload de banner.",
      });
    }
  }

  /**
   * Endpoint específico para upload de capa/imagens de Postagens
   * POST /upload/post
   */
  async handlePost(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma imagem de postagem enviada no campo 'file'.",
        });
      }

      const result = await uploadService.uploadFile({
        file: req.file,
        folder: "posts",
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Erro no UploadController (Post):", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro interno ao processar upload de postagem.",
      });
    }
  }
}

export const uploadController = new UploadController();
