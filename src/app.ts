import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./errors/AppError";

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/error-test", () => {
  throw new AppError("Error de prueba", 400, "Detalle de prueba");
});

app.use(errorHandler);

export default app;
