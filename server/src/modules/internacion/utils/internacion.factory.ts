import { apiInternacionService } from "../internacion.api.service";
import { mockInternacionService } from "../internacion.mock.service";
import { InternacionService } from "../internacion.service";

const useMock = process.env.USE_MOCK_API === "true";

export const internacionService: InternacionService = useMock
  ? mockInternacionService
  : apiInternacionService;
