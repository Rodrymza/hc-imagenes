import { apiInternoService } from "./interno.api.service.js";
import { mockInternoService } from "./interno.mock.service.js";
import { InternoService } from "./interno.service.js";

const useMock = process.env.USE_MOCK_API === "true";

export const internoService: InternoService = useMock
  ? mockInternoService
  : apiInternoService;
