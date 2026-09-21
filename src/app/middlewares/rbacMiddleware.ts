import type { Response, NextFunction } from "express";
import type { CustomRequest } from "./authMiddleware";
import PrismaSinglentonConnection from "../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { UserRole } from "@prisma/client";

const prisma = PrismaSinglentonConnection.getConnection();

/**
 * Middleware para exigir roles específicas
 * ADMIN sempre tem acesso universal
 */
export const requireRoles = (...allowedRoles: UserRole[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        const userRole = req.user.role as UserRole;

        // ADMIN sempre passa
        if (userRole === "ADMIN") {
            return next();
        }

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            message: "Acesso negado: perfil sem permissão para executar esta operação.",
            code: "FORBIDDEN_ROLE",
        });
    };
};

/**
 * Middleware para exigir nível de permissão modular
 */
export const requirePermission = (moduleKey: string, minLevel: "view" | "full" = "view") => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        const userRole = req.user.role as UserRole;
        if (userRole === "ADMIN") {
            return next();
        }

        try {
            const permission = await prisma.userPermission.findUnique({
                where: {
                    userId_moduleKey: {
                        userId: req.user.id,
                        moduleKey,
                    },
                },
            });

            if (!permission || permission.level === "none") {
                return res.status(403).json({
                    message: `Acesso negado: sem permissão para o módulo ${moduleKey}.`,
                    code: "FORBIDDEN_MODULE",
                });
            }

            if (minLevel === "full" && permission.level !== "full") {
                return res.status(403).json({
                    message: `Acesso negado: permissão insuficiente para modificação no módulo ${moduleKey}.`,
                    code: "INSUFFICIENT_LEVEL",
                });
            }

            return next();
        } catch (error) {
            return res.status(500).json({ message: "Erro ao validar permissões do usuário." });
        }
    };
};
