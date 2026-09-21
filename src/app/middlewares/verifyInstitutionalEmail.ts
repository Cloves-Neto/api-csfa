import { Request, Response, NextFunction } from "express";

export const verifyInstitutionalEmail = (req: Request, res: Response, next: NextFunction) => {
    // Se a variável de ambiente não exigir validação (ex: durante testes locais), ignoramos a checagem
    if (process.env.REQUIRE_INSTITUTIONAL_EMAIL !== "true") {
        return next();
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "E-mail é obrigatório." });
    }

    // Definindo o domínio institucional. Você pode alterar para o domínio
    const institutionalDomain = "@colsaofrancisco.com.br"; 

    if (!email.toLowerCase().endsWith(institutionalDomain)) {
        return res.status(403).json({ 
            error: `Apenas e-mails institucionais são permitidos.` 
        });
    }

    // Tudo certo, passa para o próximo middleware/controller
    next();
};
