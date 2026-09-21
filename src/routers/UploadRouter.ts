import express from "express";
import { upload } from "../app/middlewares/uploadMiddleware";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import { uploadController } from "../app/usecases/upload/UploadController";

const UploadRouter = express.Router();

// Rota genérica de upload (com suporte a folder customizado)
UploadRouter.post(
  "/",
  authMiddleware as any,
  upload.single("file"),
  uploadController.handle.bind(uploadController)
);

// Rota específica para Banners
UploadRouter.post(
  "/banner",
  authMiddleware as any,
  upload.single("file"),
  uploadController.handleBanner.bind(uploadController)
);

// Rota específica para Posts
UploadRouter.post(
  "/post",
  authMiddleware as any,
  upload.single("file"),
  uploadController.handlePost.bind(uploadController)
);

export default UploadRouter;
