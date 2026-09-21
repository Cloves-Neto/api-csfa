import cron from "node-cron";
import PrismaSinglentonConnection from "../../infrastructure/database/prisma/prismaSinglentonConnecion";
import { AuditLogService } from "../services/AuditLogService";

export class BannerExpirationJob {
  static start() {
    // Roda a cada hora (no minuto 0)
    cron.schedule("0 * * * *", async () => {
      console.log("🕒 [Cron] Rodando BannerExpirationJob...");
      const prisma = PrismaSinglentonConnection.getConnection();

      try {
        const now = new Date();
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 30);

        // Busca banners ativos criados há mais de 30 dias
        const expiredBanners = await prisma.banner.findMany({
          where: {
            isActive: true,
            createdAt: {
              lt: limitDate,
            },
          },
          select: { id: true, title: true },
        });

        if (expiredBanners.length > 0) {
          const expiredIds = expiredBanners.map((b: any) => b.id);

          // Atualiza para false
          await prisma.banner.updateMany({
            where: {
              id: { in: expiredIds },
            },
            data: {
              isActive: false,
            },
          });

          // Registra a ação no AuditLog
          await AuditLogService.log({
            userId: "SYSTEM_CRON", // Usuário de sistema para ações automáticas
            action: "AUTO_EXPIRE_BANNER",
            module: "BANNERS",
            details: `O sistema expirou automaticamente ${expiredBanners.length} banner(s). IDs: ${expiredIds.join(", ")}`,
            ipAddress: "127.0.0.1",
          });

          console.log(`✅ [Cron] BannerExpirationJob: ${expiredBanners.length} banners expirados.`);
        } else {
          console.log("✅ [Cron] BannerExpirationJob: Nenhum banner pendente de expiração.");
        }
      } catch (error) {
        console.error("❌ [Cron] BannerExpirationJob falhou:", error);
      }
    });
  }
}
