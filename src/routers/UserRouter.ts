import express from "express";
import UserGetterController from "../app/usecases/user/getter/userGetterController";
import UserCreatorController from "../app/usecases/user/creator/userCreatorController";
import UserUpdaterController from "../app/usecases/user/updater/userUpdaterController";
import UserDeleterController from "../app/usecases/user/deleter/userDeleterController";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import { requireRoles } from "../app/middlewares/rbacMiddleware";

const UserRouter = express.Router();

const userGetterController = new UserGetterController();
const userCreatorController = new UserCreatorController();
const userUpdaterController = new UserUpdaterController();
const userDeleterController = new UserDeleterController();

// Todas as rotas de usuários exigem autenticação e nível ADMIN/TI
UserRouter.use(authMiddleware as any);
UserRouter.use(requireRoles("ADMIN", "TI") as any);

UserRouter.get("/", userGetterController.getAll.bind(userGetterController));
UserRouter.get("/:id", userGetterController.getById.bind(userGetterController));
UserRouter.post("/", userCreatorController.create.bind(userCreatorController));
UserRouter.put("/:id", userUpdaterController.update.bind(userUpdaterController));
UserRouter.patch("/:id/status", userUpdaterController.updateStatus.bind(userUpdaterController));
UserRouter.delete("/:id", userDeleterController.delete.bind(userDeleterController));

export default UserRouter;
