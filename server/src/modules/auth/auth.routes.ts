import { Router } from "express";
import { authController } from "./auth.controller.js";
import { protegerRuta } from "./auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.get("/logout", protegerRuta, authController.logout);
authRoutes.get("/verify", protegerRuta, authController.verifyUser);

export default authRoutes;
