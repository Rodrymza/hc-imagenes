// src/types/express.d.ts
import { IUsuarioResponse } from "../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      // Ahora req.user tendrá .rol, .id, .username, etc.
      user?: IUsuarioResponse | string;
    }
  }
}
