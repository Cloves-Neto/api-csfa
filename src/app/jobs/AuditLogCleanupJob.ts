import cron from "node-cron";
import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";

export class AuditLogCleanupJob {
  static start() {
    // Roda todos os dias às 03:00 da manhã
    cron.schedule("0 3 * * *", async () => {
      console.log("🕒 [Cron] Rodando AuditLogCleanupJob...");
      const prisma = PrismaSinglentonConnection.getConnection();

      try {
        // Data limite: 90 dias atrás
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 90);

        const deletedLogs = await prisma.auditLog.deleteMany({
          where: {
            createdAt: {
              lt: limitDate,
            },
          },
        });

        console.log(`✅ [Cron] AuditLogCleanupJob: ${deletedLogs.count} logs (com mais de 90 dias) expurgados da base.`);
        
        // Não é recomendado gerar um AuditLog sobre a deleção de AuditLogs para evitar loop de sujeira desnecessária, 
        // mas registramos no console/log do servidor.
      } catch (error) {
        console.error("❌ [Cron] AuditLogCleanupJob falhou:", error);
      }
    });
  }
}
