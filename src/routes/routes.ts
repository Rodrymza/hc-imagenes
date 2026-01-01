import { Router } from "express";
import { AppError } from "../errors/AppError";
import internacionRoutes from "../modules/internacion/internacion.routes";

const router = Router();

// Ruta base de prueba
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/error-test", () => {
  throw new AppError("Error de prueba", 400, "Detalle de prueba");
});

router.use("/internacion", internacionRoutes);

export default router;
