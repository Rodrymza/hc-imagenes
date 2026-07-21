import { db } from "../../db/database.js";
import { IUsuarioDB, IUsuarioResponse } from "./auth.types.js";

export const operatorService = {
  cambiarOperador(pin: string): IUsuarioResponse | null {
    const user = db
      .prepare(
        "SELECT id, username, nombre, apellido, rol FROM users WHERE pin = ?",
      )
      .get(pin) as IUsuarioResponse | undefined;
    return user || null;
  },

  obtenerPorId(id: number): IUsuarioResponse | null {
    return (
      (db
        .prepare(
          "SELECT id, username, nombre, apellido, rol FROM users WHERE id = ?",
        )
        .get(id) as IUsuarioResponse | undefined) || null
    );
  },

  obtenerPorUsername(username: string): IUsuarioDB | null {
    return (
      (db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username) as IUsuarioDB | undefined) || null
    );
  },
};
