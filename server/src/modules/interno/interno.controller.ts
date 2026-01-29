import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import { apiInternoService } from "./interno.api.service";
import { loginInterno } from "./interno.auth.service";
import {
  IConfigSistema,
  SistemaConsumoInterno,
  TipoSistemaKey,
} from "./interno.types";
import { internoService } from "./interno.factory";

export const internoController = {
  async getPrestaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const prestaciones = await internoService.obtenerPrestaciones();
      return res.json(prestaciones);
    } catch (error) {
      next(error);
    }
  },

  async comprobarLoginInterno(req: Request, res: Response, next: NextFunction) {
    try {
      const estaLogueado = await loginInterno();
      const respuesta = estaLogueado
        ? "Login correcto en sistema interno"
        : "No se puedo realizar el Login interno";
      return res.json(respuesta);
    } catch (error) {
      next(error);
    }
  },

  async findPacienteInterno(req: Request, res: Response, next: NextFunction) {
    try {
      const dni = req.query.dni as string;
      const hc = req.query.hc as string;

      if (!hc && !dni) {
        throw new AppError(
          "Faltan parámetros",
          400,
          "Debes colocar Historia Clinica o Documento para buscar",
        );
      }
      if (dni && hc) {
        throw new AppError(
          "Parámetros incorrectos",
          400,
          "No puedes buscar por DNI y HC al mismo tiempo",
        );
      }

      let numeroId: string;
      let esHc: boolean;

      if (hc) {
        numeroId = hc;
        esHc = true; // ✅ Buscamos por Historia Clínica
      } else {
        numeroId = dni;
        esHc = false; // ✅ Buscamos por DNI
      }

      const paciente = await internoService.buscarPacienteInterno(
        numeroId,
        esHc,
      );
      return res.json(paciente);
    } catch (error) {
      next(error);
    }
  },

  async getPlanillaDiaria(req: Request, res: Response, next: NextFunction) {
    try {
      const { idPaciente } = req.params;
      const sistemaInput = req.query.sistema as string;
      if (!sistemaInput) {
        throw new AppError(
          "Parámetros faltantes",
          400,
          "Debes seleccionar un sistema de ingreso",
        );
      }

      if (!(sistemaInput in SistemaConsumoInterno)) {
        throw new AppError(
          "Sistema inválido",
          400,
          `El sistema '${sistemaInput}' no es válido. Opciones: ${Object.keys(SistemaConsumoInterno).join(", ")}`,
        );
      }
      const sistemaConfig: IConfigSistema =
        SistemaConsumoInterno[sistemaInput as TipoSistemaKey];

      const planillaId = await apiInternoService.obtenerPlanillaDiariaId(
        idPaciente as string,
        sistemaConfig,
      );

      return res.json({ success: true, planillaId: planillaId });
    } catch (error) {
      next(error);
    }
  },

  async getSistemaId(req: Request, res: Response, next: NextFunction) {
    try {
      const { idPaciente } = req.params; // Viene de la URL
      const { sistema, idCobertura, planillaDiariaId } = req.query;

      let mensajesError = [];
      if (!sistema) mensajesError.push("Nombre de sistema");
      if (!idCobertura) mensajesError.push("Id Cobertura de Obra Social");
      if (!planillaDiariaId) mensajesError.push("Id de Planilla Diaria");
      if (mensajesError.length > 0) {
        throw new AppError(
          "Parámetros faltantes",
          400,
          `Faltan los siguientes parámetros ${mensajesError.join(", ")}`,
        );
      }
      const sistemaInput = sistema as string;
      if (!(sistemaInput in SistemaConsumoInterno)) {
        throw new AppError(
          "Sistema inválido",
          400,
          `El sistema '${sistemaInput}' no existe. Opciones válidas: ${Object.keys(SistemaConsumoInterno).join(", ")}`,
        );
      }

      const sistemaConfig =
        SistemaConsumoInterno[sistemaInput as TipoSistemaKey];

      const sistemaId = await apiInternoService.obtenerSistemaId(
        idPaciente as string,
        idCobertura as string,
        sistemaConfig,
        planillaDiariaId as string,
      );

      return res.json({ success: true, sistemaId: sistemaId });
    } catch (error) {
      next(error);
    }
  },

  async getConsumoId(req: Request, res: Response, next: NextFunction) {
    try {
      const { idPaciente } = req.params;
      const { idCobertura, sistemaId, sistema } = req.query;

      const sistemaInput = sistema as string;
      if (!(sistemaInput in SistemaConsumoInterno)) {
        throw new AppError(
          "Sistema inválido",
          400,
          `El sistema '${sistemaInput}' no existe. Opciones válidas: ${Object.keys(SistemaConsumoInterno).join(", ")}`,
        );
      }

      const sistemaConfig =
        SistemaConsumoInterno[sistemaInput as TipoSistemaKey];

      const consumoId = await apiInternoService.obtenerConsumoId(
        idPaciente as string,
        idCobertura as string,
        sistemaId as string,
        sistemaConfig,
      );

      return res.json({ success: true, consumoId: consumoId });
    } catch (error) {
      next(error);
    }
  },

  async crearConsumoDetalle(req: Request, res: Response, next: NextFunction) {
    try {
      const { consumoId } = req.params;

      const {
        prestacionId,
        prestacionNombre,
        coberturaId,
        sistemaId, // El ID del turno original (turnoid)
      } = req.body;

      // 1. Validaciones
      const errores: string[] = [];
      if (!consumoId) errores.push("consumoId (URL)");
      if (!prestacionId) errores.push("prestacionId (Body)");
      if (!prestacionNombre) errores.push("prestacionNombre (Body)");
      if (!coberturaId) errores.push("coberturaId (Body)");
      if (!sistemaId) errores.push("sistemaId (Body)");

      if (errores.length > 0) {
        throw new AppError(
          "Datos faltantes",
          400,
          `Faltan: ${errores.join(", ")}`,
        );
      }

      const insertadoExitoso = await apiInternoService.insertarConsumoInterno(
        consumoId as string,
        prestacionId,
        prestacionNombre,
        coberturaId,
        sistemaId,
      );

      if (!insertadoExitoso) {
        throw new AppError(
          "Error al insertar consumo",
          500,
          "El sistema interno no confirmó la inserción (retornó false)",
        );
      }

      return res.status(201).json({
        success: true,
        message: "Consumo insertado correctamente en sistema interno",
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmarConsumo(req: Request, res: Response, next: NextFunction) {
    try {
      const { consumoId, sistemaId } = req.params;

      const errores: string[] = [];
      if (!consumoId) errores.push("consumoId (URL)");
      if (!sistemaId) errores.push("sistemaId (Body)");

      if (errores.length > 0) {
        throw new AppError(
          "Datos faltantes",
          400,
          `Faltan: ${errores.join(", ")}`,
        );
      }

      const confirmadoExitoso = await apiInternoService.confirmarConsumoInterno(
        consumoId as string,
        sistemaId as string,
      );

      if (!confirmadoExitoso) {
        throw new AppError(
          "Error al confirmar",
          500,
          "El sistema interno no confirmó la operación",
        );
      }

      return res.status(200).json({
        success: true,
        message: "Consumo confirmado exitosamente",
      });
    } catch (error) {
      next(error);
    }
  },

  async crearLote(req: Request, res: Response, next: NextFunction) {
    try {
      const { idPaciente } = req.params;

      // 2. Datos del Body (Lo único que envía el frontend)
      const {
        idCobertura,
        sistema, // "guardia", "ambulatorio"
        consumos, // Array [{ idPrestacion, nombrePrestacion }]
      } = req.body;

      // 3. Validaciones
      const errores: string[] = [];
      if (!idCobertura) errores.push("idCobertura");
      if (!sistema) errores.push("sistema");
      if (!consumos || !Array.isArray(consumos) || consumos.length === 0)
        errores.push("consumos (array)");

      if (errores.length > 0) {
        throw new AppError(
          "Datos faltantes",
          400,
          `Faltan: ${errores.join(", ")}`,
        );
      }

      // 4. Configuración del Sistema
      const sistemaInput = sistema as string;
      if (!(sistemaInput in SistemaConsumoInterno)) {
        throw new AppError("Sistema inválido", 400);
      }
      const sistemaConfig =
        SistemaConsumoInterno[sistemaInput as TipoSistemaKey];

      // 5. LLAMADA AL ORQUESTADOR
      // El backend se encarga de buscar planilla, turno y consumoId por su cuenta
      const reporte = await internoService.crearLoteConsumos(
        idPaciente as string,
        idCobertura,
        consumos, // Pasamos el array directo
        sistemaConfig,
      );

      const totalItems = reporte.resultados.length;
      const totalExitos = reporte.resultados.filter((r) => r.exito).length;

      // Escenario A: Éxito Total
      if (totalExitos === totalItems) {
        return res.status(201).json({
          success: true,
          message: "Todos los consumos se cargaron correctamente",
          data: reporte,
        });
      }

      if (totalExitos === 0) {
        // Devolvemos 422 (Unprocessable Entity) o 400, para que el front sepa que falló
        return res.status(422).json({
          success: false, // Marcamos false para que tu front muestre error rojo
          message:
            "No se pudo cargar ningún consumo. Verifique bloqueos de cobertura.",
          data: reporte,
        });
      }

      return res.status(207).json({
        success: true, // true parcial
        message: `Se cargaron ${totalExitos} de ${totalItems} consumos. Revise el detalle.`,
        data: reporte,
      });
    } catch (error) {
      next(error);
    }
  },
};
