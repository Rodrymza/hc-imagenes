import { Router } from "express";
import { mockInternacionService } from "./internacion.mock.service";
import { apiInternacionService } from "./internacion.api.service";

const internacionRoutes = Router();
console.log("USE_MOCK_API:", process.env.USE_MOCK_API);

const service =
  process.env.USE_MOCK_API === "true"
    ? mockInternacionService
    : apiInternacionService;

internacionRoutes.get("/", async (_req, res, next) => {
  try {
    const data = await service.obtenerPedidos();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default internacionRoutes;
