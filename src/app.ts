import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import router from "./routes/routes";

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

export default app;
