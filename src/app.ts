import express from "express";
import cors from "cors";

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
