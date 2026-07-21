import { apiInternacionService } from "../internacion.api.service.js";
import { mockInternacionService } from "../internacion.mock.service.js";
import { InternacionService } from "../internacion.service.js";

const useMock = process.env.USE_MOCK_API === "true";

export const internacionService: InternacionService = useMock
  ? mockInternacionService
  : apiInternacionService;
