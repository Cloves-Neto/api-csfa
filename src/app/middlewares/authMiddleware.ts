import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido." });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Erro no formato do token." });
    }

    const token = parts[1];
    if (!token) {
        return res.status(401).json({ message: "Token não fornecido." });
    }

    const jwtSecret = String(process.env.JWT_SECRET || "csfa_cms_jwt_secret_key_2026");

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        return next();
    } catch (e) {
        return res.status(401).json({ message: "Token inválido ou expirado." });
    }
};

export const optionalAuthMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return next();
    }

    const token = parts[1];
    if (!token) {
        return next();
    }

    const jwtSecret = String(process.env.JWT_SECRET || "csfa_cms_jwt_secret_key_2026");

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        return next();
    } catch (e) {
        // Se falhar a verificação, apenas ignoramos o token no middleware opcional
        return next();
    }
};
