import { apiGuardiaService } from "../guardia.api.service.js";
import { mockGuardiaService } from "../guardia.mock.service.js";
import { GuardiaService } from "../guardia.service.js";

const useMock = process.env.USE_MOCK_API === "true";

export const guardiaService: GuardiaService = useMock
  ? mockGuardiaService
  : apiGuardiaService;
