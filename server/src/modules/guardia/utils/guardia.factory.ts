import { apiGuardiaService } from "../guardia.api.service";
import { mockGuardiaService } from "../guardia.mock.service";
import { GuardiaService } from "../guardia.service";

const useMock = process.env.USE_MOCK_API === "true";

export const guardiaService: GuardiaService = useMock
  ? mockGuardiaService
  : apiGuardiaService;
