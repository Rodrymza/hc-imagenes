import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authOperatorController } from "./auth.operator.controller.js";
import { protegerRuta } from "./auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.get("/logout", protegerRuta, authController.logout);
authRoutes.get("/verify", protegerRuta, authController.verifyUser);

authRoutes.post(
  "/change-operator",
  protegerRuta,
  authOperatorController.changeOperator,
);
authRoutes.get(
  "/active-operator",
  protegerRuta,
  authOperatorController.getActiveOperator,
);

export default authRoutes;
