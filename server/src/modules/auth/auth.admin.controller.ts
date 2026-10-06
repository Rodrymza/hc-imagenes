import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db/database.js";
import { IUsuarioDB } from "./auth.types.js";
import { AppError } from "../../errors/AppError.js";

const SELECT_SAFE =
  "SELECT id, username, nombre, apellido, rol, hsi_username FROM users";

export const authAdminController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = db.prepare(`${SELECT_SAFE} ORDER BY id`).all();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, nombre, apellido, rol, hsi_username, hsi_password } =
        req.body;

      if (!username || !password) {
        throw new AppError("Username y password son requeridos", 400);
      }

      const existing = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(username);
      if (existing) {
        throw new AppError("El usuario ya existe", 409);
      }

      const hash = bcrypt.hashSync(password, 10);

      const result = db
        .prepare(
          `INSERT INTO users (username, password, nombre, apellido, rol, hsi_username, hsi_password)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          username,
          hash,
          nombre || "",
          apellido || "",
          rol || "USER",
          hsi_username || "",
          hsi_password || "",
        );

      const user = db
        .prepare(`${SELECT_SAFE} WHERE id = ?`)
        .get(result.lastInsertRowid);

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { username, password, nombre, apellido, rol, hsi_username, hsi_password } =
        req.body;

      const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
      if (!existing) {
        throw new AppError("Usuario no encontrado", 404);
      }

      if (username) {
        const duplicate = db
          .prepare("SELECT id FROM users WHERE username = ? AND id != ?")
          .get(username, id);
        if (duplicate) {
          throw new AppError("El nombre de usuario ya está en uso", 409);
        }
      }

      let hash: string | undefined;
      if (password) {
        hash = bcrypt.hashSync(password, 10);
      }

      db.prepare(
        `UPDATE users SET
          username = COALESCE(?, username),
          password = COALESCE(?, password),
          nombre = COALESCE(?, nombre),
          apellido = COALESCE(?, apellido),
          rol = COALESCE(?, rol),
          hsi_username = COALESCE(?, hsi_username),
          hsi_password = COALESCE(?, hsi_password)
         WHERE id = ?`,
      ).run(
        username || null,
        hash || null,
        nombre ?? null,
        apellido ?? null,
        rol || null,
        hsi_username || null,
        hsi_password || null,
        id,
      );

      const user = db
        .prepare(`${SELECT_SAFE} WHERE id = ?`)
        .get(id);

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
      if (!existing) {
        throw new AppError("Usuario no encontrado", 404);
      }

      db.prepare("DELETE FROM users WHERE id = ?").run(id);

      res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
      next(error);
    }
  },
};
