import { Router } from "express";
import { AppError } from "../errors/AppError";
import internacionRoutes from "../modules/internacion/internacion.routes";
import guardiaRoutes from "../modules/guardia/guardia.routes";
import internoRoutes from "../modules/interno/interno.routes";
import authRoutes from "../modules/auth/auth.routes";
import { protegerRuta } from "../modules/auth/auth.middleware";

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
router.use("/auth", authRoutes);
export default router;
