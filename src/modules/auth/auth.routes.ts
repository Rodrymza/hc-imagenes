import { Router } from "express";
import { authController } from "./auth.controller";
import { protegerRuta } from "./auth.middleware";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.get("/logout", protegerRuta, authController.logout);

export default authRoutes;
