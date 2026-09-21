import express from "express";
import { AuthRepository } from "../app/repositories/auth/authRepository";

import RegisterController from "../app/usecases/auth/register/registerController";
import LoginController from "../app/usecases/auth/login/loginController";
import VerifyEmailController from "../app/usecases/auth/verify/verifyEmailController";
import ResetPasswordController from "../app/usecases/auth/reset/resetPasswordController";
import { verifyInstitutionalEmail } from "../app/middlewares/verifyInstitutionalEmail";
import { authMiddleware } from "../app/middlewares/authMiddleware";

const AuthRouter = express.Router();

// Instanciando Controllers
const registerController = new RegisterController();
const loginController = new LoginController();
const verifyEmailController = new VerifyEmailController();
const resetPasswordController = new ResetPasswordController();

// Definindo rotas de Autenticação
AuthRouter.post("/register", verifyInstitutionalEmail, registerController.register.bind(registerController));
AuthRouter.post("/login", loginController.login.bind(loginController));
AuthRouter.get("/verify-email", verifyEmailController.verifyEmail.bind(verifyEmailController));

// Definindo rotas de Redefinição de Senha
AuthRouter.post("/password-reset/request", resetPasswordController.requestReset.bind(resetPasswordController));
AuthRouter.post("/password-reset/confirm", resetPasswordController.confirmReset.bind(resetPasswordController));

// Rota protegida para TI redefinir senhas diretamente
AuthRouter.post("/password-reset/admin", authMiddleware as any, resetPasswordController.adminReset.bind(resetPasswordController));

export default AuthRouter;
