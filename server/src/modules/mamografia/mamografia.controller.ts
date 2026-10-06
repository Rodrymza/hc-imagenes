import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError.js";
import { capitalize } from "../../utils/string.utils.js";
import { mamografiaService } from "./mamografia.service.js";
import {
  CuadranteEnum,
  MamaEnum,
  OrigenEnum,
  TipoEstudioEnum,
  TurnoEnum,
} from "./mamografia.types.js";

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function validarFecha(valor: string, campo: string): string {
  if (!valor || !ES_FECHA.test(valor)) {
    throw new AppError(
      "Parámetros incorrectos",
      400,
      `El campo '${campo}' debe tener formato YYYY-MM-DD.`,
    );
  }
  return valor;
}

const nombreUsuarioActivo = (req: Request): string | null => {
  const user = req.user;
  if (!user || !user.apellido || !user.nombre) return null;
  return `${capitalize(user.apellido)}, ${capitalize(user.nombre)}`;
};

export const mamografiaController = {
  async getPacienteConHistorial(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const dni = (req.query.dni as string) ?? "";
      if (!dni.trim()) {
        throw new AppError(
          "Faltan parámetros",
          400,
          "Debes ingresar un DNI para buscar a la paciente.",
        );
      }
      const historial = await mamografiaService.buscarOCrearPaciente(dni);
      return res.json(historial);
    } catch (error) {
      next(error);
    }
  },

  async getHistorial(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError("Parámetros incorrectos", 400, "ID de paciente inválido.");
      }
      const historial = mamografiaService.getHistorial(id);
      return res.json(historial);
    } catch (error) {
      next(error);
    }
  },

  async actualizarPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError("Parámetros incorrectos", 400, "ID de paciente inválido.");
      }

      const {
        nombre,
        apellido,
        fecha_nacimiento,
        telefono,
        email,
        domicilio,
      } = req.body ?? {};

      if (
        nombre === undefined &&
        apellido === undefined &&
        fecha_nacimiento === undefined &&
        telefono === undefined &&
        email === undefined &&
        domicilio === undefined
      ) {
        throw new AppError(
          "Datos faltantes",
          400,
          "Debes enviar al menos un campo para actualizar.",
        );
      }

      if (fecha_nacimiento && !ES_FECHA.test(String(fecha_nacimiento))) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "fecha_nacimiento debe tener formato YYYY-MM-DD.",
        );
      }

      const paciente = mamografiaService.actualizarPaciente(id, {
        nombre: nombre === undefined ? undefined : String(nombre),
        apellido: apellido === undefined ? undefined : String(apellido),
        fecha_nacimiento:
          fecha_nacimiento === undefined
            ? undefined
            : fecha_nacimiento
              ? String(fecha_nacimiento)
              : null,
        telefono: telefono === undefined ? undefined : telefono ? String(telefono) : null,
        email: email === undefined ? undefined : email ? String(email) : null,
        domicilio:
          domicilio === undefined ? undefined : domicilio ? String(domicilio) : null,
      });

      return res.json({ success: true, paciente });
    } catch (error) {
      next(error);
    }
  },

  async crearPacienteManual(req: Request, res: Response, next: NextFunction) {
    try {
      const { dni, nombre, apellido, fecha_nacimiento, telefono, email, domicilio } =
        req.body ?? {};

      const dniLimpio = String(dni ?? "").trim();
      if (dniLimpio.length < 6) {
        throw new AppError(
          "Datos faltantes",
          400,
          "Debes ingresar un DNI válido (mínimo 6 dígitos).",
        );
      }
      if (!nombre || !String(nombre).trim()) {
        throw new AppError(
          "Datos faltantes",
          400,
          "El nombre es obligatorio.",
        );
      }
      if (!apellido || !String(apellido).trim()) {
        throw new AppError(
          "Datos faltantes",
          400,
          "El apellido es obligatorio.",
        );
      }
      if (fecha_nacimiento && !ES_FECHA.test(String(fecha_nacimiento))) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "fecha_nacimiento debe tener formato YYYY-MM-DD.",
        );
      }

      const historial = mamografiaService.crearPacienteManual({
        dni: dniLimpio,
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        fecha_nacimiento: fecha_nacimiento ? String(fecha_nacimiento) : null,
        telefono: telefono ? String(telefono) : null,
        email: email ? String(email) : null,
        domicilio: domicilio ? String(domicilio) : null,
      });

      return res.status(201).json(historial);
    } catch (error) {
      next(error);
    }
  },

  async getEstudio(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError("Parámetros incorrectos", 400, "ID de estudio inválido.");
      }
      const estudio = mamografiaService.getEstudio(id);
      return res.json(estudio);
    } catch (error) {
      next(error);
    }
  },

  async eliminarEstudio(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError("Parámetros incorrectos", 400, "ID de estudio inválido.");
      }
      const operador = nombreUsuarioActivo(req) ?? "Administrador";
      mamografiaService.eliminarEstudio(id, operador);
      return res.json({ success: true, message: "Estudio eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  },

  async crearEstudio(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body ?? {};

      if (!body.dni || !String(body.dni).trim()) {
        throw new AppError("Datos faltantes", 400, "El DNI es obligatorio.");
      }

      // Origen
      const origenes = Object.values(OrigenEnum);
      if (!origenes.includes(body.origen)) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          `origen inválido. Opciones: ${origenes.join(" | ")}`,
        );
      }

      // Tipo de estudio
      const tipos = Object.values(TipoEstudioEnum);
      if (!tipos.includes(body.tipo_estudio)) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "El tipo de estudio seleccionado no es válido.",
        );
      }

      // Turno (opcional): solo Mañana o Tarde
      if (body.turno != null && ![TurnoEnum.MANANA, TurnoEnum.TARDE].includes(body.turno)) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          `turno inválido. Opciones: ${TurnoEnum.MANANA} | ${TurnoEnum.TARDE}`,
        );
      }

      if (body.fecha_estudio) validarFecha(String(body.fecha_estudio), "fecha_estudio");

      // Hallazgos
      const mamas = Object.values(MamaEnum);
      const cuadrantes = Object.values(CuadranteEnum);
      for (const h of Array.isArray(body.hallazgos) ? body.hallazgos : []) {
        if (!mamas.includes(h.mama)) {
          throw new AppError(
            "Parámetros incorrectos",
            400,
            `Mama inválida: ${h.mama}`,
          );
        }
        if (!cuadrantes.includes(h.cuadrante)) {
          throw new AppError(
            "Parámetros incorrectos",
            400,
            `Cuadrante inválido: ${h.cuadrante}`,
          );
        }
      }

      const resultado = mamografiaService.crearEstudio(
        {
          dni: String(body.dni).trim(),
          fecha_estudio: body.fecha_estudio,
          turno: body.turno ?? null,
          origen: body.origen,
          tipo_estudio: body.tipo_estudio,
          anamnesis: body.anamnesis ?? undefined,
          contacto: body.contacto ?? undefined,
          hallazgos: body.hallazgos ?? [],
        },
        nombreUsuarioActivo(req),
      );

      return res.status(201).json({
        success: true,
        message: "Estudio guardado correctamente",
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEstadisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const desde = validarFecha((req.query.desde as string) ?? "", "desde");
      const hasta = validarFecha((req.query.hasta as string) ?? "", "hasta");

      if (desde > hasta) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "La fecha 'desde' no puede ser posterior a 'hasta'.",
        );
      }

      const turnoRaw = (req.query.turno as string) || undefined;
      let turno: TurnoEnum | null = null;
      if (turnoRaw) {
        if (![TurnoEnum.MANANA, TurnoEnum.TARDE].includes(turnoRaw as TurnoEnum)) {
          throw new AppError(
            "Parámetros incorrectos",
            400,
            `turno inválido. Opciones: ${TurnoEnum.MANANA} | ${TurnoEnum.TARDE}`,
          );
        }
        turno = turnoRaw as TurnoEnum;
      }

      const filas = mamografiaService.getEstadisticas({ desde, hasta, turno });
      return res.json(filas);
    } catch (error) {
      next(error);
    }
  },

  async getRegistros(req: Request, res: Response, next: NextFunction) {
    try {
      const rawDesde = (req.query.desde as string) || undefined;
      const rawHasta = (req.query.hasta as string) || undefined;
      const desde = rawDesde ? validarFecha(rawDesde, "desde") : null;
      const hasta = rawHasta ? validarFecha(rawHasta, "hasta") : null;
      if (desde && hasta && desde > hasta) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "La fecha 'desde' no puede ser posterior a 'hasta'.",
        );
      }

      const turnoRaw = (req.query.turno as string) || undefined;
      let turno: TurnoEnum | null = null;
      if (turnoRaw) {
        if (![TurnoEnum.MANANA, TurnoEnum.TARDE].includes(turnoRaw as TurnoEnum)) {
          throw new AppError(
            "Parámetros incorrectos",
            400,
            `turno inválido. Opciones: ${TurnoEnum.MANANA} | ${TurnoEnum.TARDE}`,
          );
        }
        turno = turnoRaw as TurnoEnum;
      }

      const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
      const porPagina = req.query.porPagina ? Number(req.query.porPagina) : 15;
      if (!Number.isInteger(pagina) || pagina < 1) {
        throw new AppError("Parámetros incorrectos", 400, "pagina debe ser un entero mayor a 0.");
      }
      if (!Number.isInteger(porPagina) || porPagina < 1 || porPagina > 100) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "porPagina debe ser un entero entre 1 y 100.",
        );
      }

      const registros = mamografiaService.listarRegistros({
        q: (req.query.q as string) || null,
        desde,
        hasta,
        turno,
        pagina,
        porPagina,
      });

      return res.json(registros);
    } catch (error) {
      next(error);
    }
  },
};