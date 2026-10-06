import { NextFunction, Request, Response } from "express";
import { IPedidoGuardia } from "./guardia.types.js";
import { AppError } from "../../errors/AppError.js";
import { guardiaService } from "./utils/guardia.factory.js";
import { loginCon2FA, logoutHsi } from "./guardia.auth.service.js";
import { mockLoginCon2FA } from "./guardia.mock.service.js";
import { hasSesion, removeSesion } from "./guardia.session.js";
import { db } from "../../db/database.js";

const useMock = process.env.USE_MOCK_API === "true";

function getUsername(req: Request): string {
  return req.user!.username;
}

function getHsiCredentials(username: string): {
  hsi_username: string;
  hsi_password: string;
} | null {
  return (
    (db
      .prepare(
        "SELECT hsi_username, hsi_password FROM users WHERE username = ?",
      )
      .get(username) as { hsi_username: string; hsi_password: string } | undefined) || null
  );
}

export const guardiaControler = {
  async loginGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      const { totpCode } = req.body;

      if (!totpCode && !useMock) {
        throw new AppError(
          "Falta el código TOTP",
          400,
          "Se requiere el código de 6 dígitos del Authenticator",
        );
      }

      const creds = getHsiCredentials(username);
      if (!creds || !creds.hsi_username || !creds.hsi_password) {
        throw new AppError(
          "Usuario sin credenciales HSI",
          400,
          "El usuario no tiene credenciales HSI configuradas",
        );
      }

      const loginFn = useMock ? mockLoginCon2FA : loginCon2FA;
      const result = await loginFn(
        username,
        creds.hsi_username,
        creds.hsi_password,
        totpCode || "mock",
      );

      return res.json({
        success: true,
        message: useMock
          ? `[MOCK] Sesión HSI iniciada para ${result.username}`
          : `Sesión HSI iniciada para ${result.username}`,
      });
    } catch (error) {
      next(error);
    }
  },

  async logoutGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      if (useMock) {
        removeSesion(username);
        console.log(`[MOCK] Sesión HSI eliminada para "${username}"`);
      } else {
        logoutHsi(username);
      }

      return res.json({
        success: true,
        message: useMock
          ? `[MOCK] Sesión HSI cerrada para ${username}`
          : "Sesión HSI cerrada",
      });
    } catch (error) {
      next(error);
    }
  },

  async hsiStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      const active = hasSesion(username);

      return res.json({
        hasSession: active,
        username: username,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPedidosGuardia(
    req: Request,
    res: Response<IPedidoGuardia[]>,
    next: NextFunction,
  ) {
    try {
      const username = getUsername(req);
      const { fecha } = req.query;

      if (fecha && typeof fecha !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      const pedidos = await guardiaService.obtenerPedidosGuardia(
        username,
        fecha,
      );
      return res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  async getPedidosPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      const { idPatient } = req.params;

      if (idPatient && typeof idPatient !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      if (!idPatient) {
        throw new AppError(
          "Falta ID del paciente para obtener los pedidos",
          400,
        );
      }
      const pedidosPaciente =
        await guardiaService.obtenerPedidosPaciente(username, idPatient);

      return res.json(pedidosPaciente);
    } catch (error) {
      next(error);
    }
  },

  async finalizarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      const { idEstudio, idPatient } = req.params;

      await guardiaService.finalizarPedido(
        username,
        idEstudio as string,
        idPatient as string,
      );
      return res.json({
        succes: true,
        message: `Estudio ${idEstudio} finalizado correctamente`,
      });
    } catch (error) {
      next(error);
    }
  },

  async transferirPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      const { idEstudio } = req.params;

      await guardiaService.transferirPedido(username, idEstudio as string);
      return res.json({
        succes: true,
        message: `Estudio ${idEstudio} transferido correctamente`,
      });
    } catch (error) {
      next(error);
    }
  },

  async findPacienteGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const username = getUsername(req);
      const { dniPaciente } = req.params;

      if (!dniPaciente) {
        throw new AppError("Falta dni para la busqueda", 400);
      }
      if (dniPaciente && typeof dniPaciente !== "string") {
        throw new AppError("Formato de documento inválido", 400);
      }

      const paciente =
        await guardiaService.buscarDatosPacienteGuardia(username, dniPaciente);

      if (!paciente) {
        throw new AppError(
          "Paciente no encontrado",
          404,
          "No se encontro paciente con el DNI especificado",
        );
      }

      return res.json(paciente);
    } catch (error) {
      next(error);
    }
  },
};
