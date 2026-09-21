import nodemailer from "nodemailer";
import type { IEmailProvider } from "../../app/models/iEmailProvider";

export default class NodemailerEmailProvider implements IEmailProvider {
    private transporter: any;

    public constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.mailtrap.io",
            port: Number(process.env.SMTP_PORT) || 2525,
            auth: {
                user: process.env.SMTP_USER || "sua_conta_mailtrap",
                pass: process.env.SMTP_PASS || "sua_senha_mailtrap",
            },
        });
    }

    public async sendMail(to: string, subject: string, body: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"API CSFA" <noreply@csfa.com.br>',
                to,
                subject,
                html: body,
            });
            console.log(`[EmailProvider] E-mail enviado para ${to}`);
        } catch (error) {
            console.error(`[EmailProvider] Erro ao enviar e-mail:`, error);
            throw error;
        }
    }
}
