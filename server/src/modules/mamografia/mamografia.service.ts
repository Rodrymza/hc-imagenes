import { AppError } from "../../errors/AppError.js";
import { capitalize } from "../../utils/string.utils.js";
import { internoService } from "../interno/interno.factory.js";
import {
  IEstadisticaFiltros,
  IEstadisticaRow,
  IEstudioConHallazgos,
  IEstudioDetalle,
  IEstudioPayload,
  IFiltrosRegistros,
  IHistorialPaciente,
  IPacienteMamografia,
  IPaginacionRegistros,
  MamaEnum,
  OrigenEnum,
  TIPOS_ESTUDIO,
  TurnoEnum,
} from "./mamografia.types.js";
import { mamografiaRepository } from "./mamografia.repository.js";

// Tiempo máximo de espera a la intranet; evita colgar el endpoint si el sistema interno no responde.
const TIEMPO_MAX_INTRANET_MS = 15000;

// Convierte "DD-MM-YYYY" (formato intranet) a "YYYY-MM-DD" para almacenar de forma ordenable
// Normaliza un texto quitando acentos (espejo JS del fragmento SQL SIN_ACENTOS)
export const quitarAcentos = (texto: string): string =>
  texto
    .toLowerCase()
    .replace(/á|à|â|ä/g, "a")
    .replace(/é|è|ê|ë/g, "e")
    .replace(/í|ì|î|ï/g, "i")
    .replace(/ó|ò|ô|ö/g, "o")
    .replace(/ú|ù|û|ü/g, "u")
    .replace(/ñ/g, "n")
    .replace(/ç/g, "c");

export const fechaArgentinaAISO = (fecha: string | null): string | null => {
  if (!fecha) return null;
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  const [dia, mes, anio] = partes;
  if (dia.length !== 2 || mes.length !== 2 || anio.length !== 4) return fecha;
  return `${anio}-${mes}-${dia}`;
};

export const mamografiaService = {
  /**
   * Caché read-through: primero local; si no existe, consulta la intranet y
   * persiste únicamente los datos filiatorios. El contacto queda vacío.
   */
  async buscarOCrearPaciente(dni: string): Promise<IHistorialPaciente> {
    const dniLimpio = dni.trim();

    const local = mamografiaRepository.findPacienteByDni(dniLimpio);
    if (local) {
      return {
        paciente: local,
        estudios: this.estudiosConHallazgos(local.id),
        origen: "local",
      };
    }

    let intranet = null;
    try {
      intranet = await Promise.race([
        internoService.buscarPacienteInterno(dniLimpio, false),
        new Promise<null>((_, reject) =>
          setTimeout(
            () => reject(new Error("Tiempo de espera con la intranet agotado")),
            TIEMPO_MAX_INTRANET_MS,
          ),
        ),
      ]);
    } catch (error) {
      throw new AppError(
        "No se pudo consultar el sistema central",
        502,
        "Verifique la conexión a la intranet e intente nuevamente.",
      );
    }

    if (!intranet) {
      throw new AppError(
        "Paciente no registrado",
        404,
        "El DNI no existe en la base local ni en el Sistema Interno del hospital.",
      );
    }

    const id = mamografiaRepository.insertPaciente({
      dni: dniLimpio,
      nombre: capitalize(intranet.nombres || dniLimpio),
      apellido: capitalize(intranet.apellidos || dniLimpio),
      fecha_nacimiento: fechaArgentinaAISO(intranet.fechaNacimientoString),
    });

    const paciente = mamografiaRepository.findPacienteById(id)!;
    return { paciente, estudios: [], origen: "intranet" };
  },

  getHistorial(pacienteId: number): IHistorialPaciente {
    const paciente = mamografiaRepository.findPacienteById(pacienteId);
    if (!paciente) {
      throw new AppError("Paciente no encontrado", 404);
    }
    return {
      paciente,
      estudios: this.estudiosConHallazgos(paciente.id),
      origen: "local",
    };
  },

  /**
   * Alta manual de respaldo cuando la intranet no responde o el DNI no figura.
   * Si el DNI ya existe localmente, devuelve su historial (operación idempotente).
   */
  crearPacienteManual(data: {
    dni: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string | null;
    telefono?: string | null;
    email?: string | null;
    domicilio?: string | null;
  }): IHistorialPaciente {
    const dni = data.dni.trim();
    const existente = mamografiaRepository.findPacienteByDni(dni);
    if (existente) {
      return this.getHistorial(existente.id);
    }

    const id = mamografiaRepository.insertPaciente({
      dni: dni,
      nombre: capitalize(data.nombre.trim()),
      apellido: capitalize(data.apellido.trim()),
      fecha_nacimiento: data.fecha_nacimiento,
    });

    if (
      data.telefono ||
      data.email ||
      data.domicilio
    ) {
      mamografiaRepository.updateContactoPaciente(id, {
        telefono: data.telefono ?? null,
        email: data.email ?? null,
        domicilio: data.domicilio ?? null,
      });
    }

    const paciente = mamografiaRepository.findPacienteById(id)!;
    return { paciente, estudios: [], origen: "manual" };
  },

  estudiosConHallazgos(pacienteId: number): IEstudioConHallazgos[] {
    return mamografiaRepository
      .estudiosConHallazgos(pacienteId)
      .map((e) => ({
        ...e,
        turno: (e.turno as TurnoEnum) ?? null,
        origen: e.origen as OrigenEnum,
        hallazgos: e.hallazgos.map((h) => ({
          ...h,
          mama: h.mama as MamaEnum,
        })),
      }));
  },

  getEstudio(id: number): IEstudioDetalle {
    const estudio = mamografiaRepository.findEstudioById(id);
    if (!estudio) {
      throw new AppError("Estudio no encontrado", 404);
    }
    const paciente = mamografiaRepository.findPacienteById(estudio.paciente_id);
    if (!paciente) {
      throw new AppError("Paciente no encontrada", 404);
    }
    return {
      ...estudio,
      turno: (estudio.turno as TurnoEnum) ?? null,
      origen: estudio.origen as OrigenEnum,
      hallazgos: estudio.hallazgos.map((h) => ({
        ...h,
        mama: h.mama as MamaEnum,
      })),
      paciente,
    };
  },

  crearEstudio(
    payload: IEstudioPayload,
    operador?: string | null,
  ): { estudio: IEstudioConHallazgos; origen: "local" } {
    const paciente = mamografiaRepository.findPacienteByDni(payload.dni.trim());
    if (!paciente) {
      throw new AppError(
        "La paciente no está registrada",
        404,
        "Busque primero el DNI en la ficha antes de guardar el estudio.",
      );
    }

    const fecha =
      payload.fecha_estudio ||
      new Date().toISOString().slice(0, 10);

    const hallazgos = (payload.hallazgos ?? [])
      .filter((h) => h.tipo_hallazgo || h.observaciones)
      .map((h) => ({
        mama: h.mama,
        cuadrante: h.cuadrante,
        tipo_hallazgo: h.tipo_hallazgo ?? null,
        observaciones: h.observaciones ?? null,
      }));

    const id = mamografiaRepository.insertEstudioConHallazgos({
      paciente_id: paciente.id,
      fecha_estudio: fecha,
      turno: payload.turno ?? null,
      origen: payload.origen,
      tipo_estudio: payload.tipo_estudio,
      anamnesis: (payload.anamnesis ?? {}) as Record<string, unknown>,
      hallazgos,
      contacto: payload.contacto,
      registrado_por: operador ?? null,
    });

    return { estudio: this.getEstudio(id), origen: "local" };
  },

  eliminarEstudio(id: number, operador: string): void {
    const exito = mamografiaRepository.softDeleteEstudio(id, operador);
    if (!exito) {
      throw new AppError(
        "Estudio no encontrado",
        404,
        "El estudio no existe o ya fue eliminado.",
      );
    }
  },

  actualizarPaciente(
    id: number,
    data: {
      nombre?: string;
      apellido?: string;
      fecha_nacimiento?: string | null;
      telefono?: string | null;
      email?: string | null;
      domicilio?: string | null;
    },
  ): IPacienteMamografia {
    const existe = mamografiaRepository.findPacienteById(id);
    if (!existe) {
      throw new AppError("Paciente no encontrado", 404);
    }

    if (data.nombre !== undefined) {
      data.nombre = data.nombre.trim() ? capitalize(data.nombre.trim()) : "";
    }
    if (data.apellido !== undefined) {
      data.apellido = data.apellido.trim() ? capitalize(data.apellido.trim()) : "";
    }

    mamografiaRepository.updatePaciente(id, data);
    return mamografiaRepository.findPacienteById(id)!;
  },

  getEstadisticas(filtros: IEstadisticaFiltros): IEstadisticaRow[] {
    const filas = mamografiaRepository.estadisticas({
      desde: filtros.desde,
      hasta: filtros.hasta,
      turno: filtros.turno ?? null,
    });

    const mapa = new Map<
      string,
      { ce: number; internado: number; total: number }
    >();

    for (const f of filas) {
      const acc = mapa.get(f.tipo_estudio) ?? { ce: 0, internado: 0, total: 0 };
      if (f.origen === OrigenEnum.CE) acc.ce += f.cantidad;
      else acc.internado += f.cantidad;
      acc.total = acc.ce + acc.internado;
      mapa.set(f.tipo_estudio, acc);
    }

    return TIPOS_ESTUDIO.map((tipo) => {
      const acc = mapa.get(tipo) ?? { ce: 0, internado: 0, total: 0 };
      return {
        tipo_estudio: tipo,
        ce: acc.ce,
        internado: acc.internado,
        total: acc.total,
      };
    });
  },

  listarRegistros(
    filtros: IFiltrosRegistros,
  ): IPaginacionRegistros {
    const q = filtros.q?.trim() || null;
    const registros = mamografiaRepository.listarRegistros({
      q: q ? quitarAcentos(q) : null,
      desde: filtros.desde?.trim() || null,
      hasta: filtros.hasta?.trim() || null,
      turno: filtros.turno ?? null,
      pagina: filtros.pagina,
      porPagina: filtros.porPagina,
    });

    return {
      total: registros.total,
      pagina: registros.pagina,
      porPagina: registros.porPagina,
      totalPaginas: registros.totalPaginas,
      items: registros.items.map((r) => ({
        ...r,
        turno: (r.turno as TurnoEnum) ?? null,
        origen: r.origen as OrigenEnum,
      })),
    };
  },
};