import { Router } from "express";
import { authAdminController } from "./auth.admin.controller.js";

const authAdminRoutes = Router();

authAdminRoutes.get("/", authAdminController.getAll);
authAdminRoutes.post("/", authAdminController.create);
authAdminRoutes.put("/:id", authAdminController.update);
authAdminRoutes.delete("/:id", authAdminController.remove);

export { authAdminRoutes };
