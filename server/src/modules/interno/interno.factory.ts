import { apiInternoService } from "./interno.api.service";
import { mockInternoService } from "./interno.mock.service";
import { InternoService } from "./interno.service";

const useMock = process.env.USE_MOCK_API === "true";

export const internoService: InternoService = useMock
  ? mockInternoService
  : apiInternoService;
