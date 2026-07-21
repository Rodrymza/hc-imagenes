import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import router from "./routes/routes.js";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares básicos
app.use(
  cors({
    origin: true,
    credentials: true, // Esto es OBLIGATORIO porque usamos cookies/sesiones
  }),
);
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api", router);

app.use(errorHandler);

export default app;
