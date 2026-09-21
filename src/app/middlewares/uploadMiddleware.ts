import multer from "multer";
import { Request } from "express";

// Armazena o arquivo temporariamente na memória RAM para stream / upload ao Supabase
const storage = multer.memoryStorage();

// Limite padrão de 50MB para imagens e mídias
const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Limite expandido de 150MB para importação de calendários e arquivos pesados
const MAX_CALENDAR_FILE_SIZE = 150 * 1024 * 1024; // 150MB

const mediaFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo inválido (${file.mimetype}). Tipos aceitos: JPG, PNG, WEBP, GIF, SVG e PDF.`));
  }
};

const calendarCsvFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isCsv =
    file.mimetype.includes("csv") ||
    file.mimetype.includes("excel") ||
    file.mimetype.includes("text/plain") ||
    file.originalname.toLowerCase().endsWith(".csv");

  if (isCsv) {
    cb(null, true);
  } else {
    cb(new Error("Formato inválido. Por favor, envie um arquivo no formato CSV (.csv)."));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_MEDIA_FILE_SIZE,
  },
  fileFilter: mediaFilter,
});

export const uploadCalendar = multer({
  storage,
  limits: {
    fileSize: MAX_CALENDAR_FILE_SIZE,
  },
  fileFilter: calendarCsvFilter,
});
