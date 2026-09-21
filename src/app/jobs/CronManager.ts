import { BannerExpirationJob } from "./BannerExpirationJob";
import { AuditLogCleanupJob } from "./AuditLogCleanupJob";

export class CronManager {
  /**
   * Inicializa todas as rotinas em background do sistema.
   * Deve ser invocado no startup do servidor.
   */
  static start() {
    console.log("🔄 Inicializando rotinas do CronManager...");
    BannerExpirationJob.start();
    AuditLogCleanupJob.start();
    console.log("✅ CronManager ativo.");
  }
}
