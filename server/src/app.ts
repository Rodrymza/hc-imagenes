import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import router from "./routes/routes";
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
app.use(cookieParser()); // <--- Habilita req.cookies

app.use("/api", router);

app.use(errorHandler);

export default app;
