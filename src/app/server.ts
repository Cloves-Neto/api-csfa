import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import PrismaSinglentonConnection from "../infrastructure/database/prisma/prismaSinglentonConnecion";
import { CronManager } from "./jobs/CronManager";

import AuthRouter from "../routers/AuthRouter";
import UserRouter from "../routers/UserRouter";
import PostsRouter from "../routers/PostRouter";
import BannerRouter from "../routers/BannerRouter";
import AgendaRouter from "../routers/AgendaRouter";
import TagRouter from "../routers/TagRouter";
import DashboardRouter from "../routers/DashboardRouter";
import UploadRouter from "../routers/UploadRouter";
import { notificationRouter } from "../routers/NotificationRouter";
import { logRouter } from "../routers/LogRouter";
import { schoolMaterialRouter } from "../routers/SchoolMaterialRouter";
import { contactRouter } from "../routers/ContactRouter";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use("/auth", AuthRouter);
app.use("/users", UserRouter);
app.use("/posts", PostsRouter);
app.use("/banners", BannerRouter);
app.use("/agenda", AgendaRouter);
app.use("/events", AgendaRouter); // Alias para conveniência
app.use("/tags", TagRouter);
app.use("/dashboard", DashboardRouter);
app.use("/upload", UploadRouter);
app.use("/notifications", notificationRouter);
app.use("/logs", logRouter);
app.use("/materials", schoolMaterialRouter);
app.use("/school-materials", schoolMaterialRouter);
app.use("/contact", contactRouter);
app.use("/careers", contactRouter);
app.use("/admissions", contactRouter);
app.use("/", PostsRouter); // Compatibilidade legado

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  try {
    const prisma = PrismaSinglentonConnection.getConnection();
    await prisma.$connect();
    console.log("🟢 Conexão com o banco de dados (Prisma) estabelecida com sucesso.");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      // Inicia as rotinas automáticas (Cronjobs)
      CronManager.start();
    });
  } catch (error) {
    console.error("🔴 Erro ao inicializar o servidor:", error);
    process.exit(1);
  }
}

bootstrap();

export default app;