import { Router } from "express";
import { AppError } from "../errors/AppError.js";
import internacionRoutes from "../modules/internacion/internacion.routes.js";
import guardiaRoutes from "../modules/guardia/guardia.routes.js";
import internoRoutes from "../modules/interno/interno.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import { protegerRuta, restringirA } from "../modules/auth/auth.middleware.js";
import { authAdminRoutes } from "../modules/auth/auth.admin.routes.js";

const router = Router();

// Ruta base de prueba
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/error-test", () => {
  throw new AppError("Error de prueba", 400, "Detalle de prueba");
});

router.use("/internacion", protegerRuta, internacionRoutes);
router.use("/guardia", protegerRuta, guardiaRoutes);
router.use("/interno", protegerRuta, internoRoutes);
router.use("/auth/users", protegerRuta, restringirA("ADMIN"), authAdminRoutes);
router.use("/auth", authRoutes);
export default router;
