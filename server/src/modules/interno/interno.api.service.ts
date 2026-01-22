import { XMLParser } from "fast-xml-parser";
import { internoApi } from "./interno.api";
import { loginInterno } from "./interno.auth.service";
import { AppError } from "../../errors/AppError";
import { cleanPacienteInterno } from "./interno.mapper";
import {
  IConfigSistema,
  IConsumoItem,
  IEstudioConfig,
  IPacienteInterno,
  IResultadoLote,
  SistemaConsumoInterno,
} from "./interno.types";
import estudiosData from "../../data/prestaciones.json";
// 1. Configuración del Parser
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  // Forzamos arrays en 'coberturas' para consistencia
  isArray: (tagName) => tagName === "coberturas",
});

// ==========================================
// 🛠️ UTILIDADES PRIVADAS (Helpers)
// ==========================================

/**
 * Busca una clave en un objeto JSON de profundidad desconocida.
 * Útil para cuando no sabemos la estructura exacta del XML.
 */
function buscarValorRecursivo(obj: any, key: string): any {
  if (!obj || typeof obj !== "object") return null;

  if (key in obj) return obj[key];

  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const resultado = buscarValorRecursivo(obj[k], key);
      if (resultado !== null && resultado !== undefined) {
        return resultado;
      }
    }
  }
  return null;
}

/**
 * Wrapper Maestro: Maneja la lógica de Sesión y Reintentos.
 * Ejecuta la operación, si falla por sesión, reloguea y reintenta.
 */
const ejecutarPeticionInterna = async <T>(
  descripcion: string,
  operacion: () => Promise<T>,
): Promise<T> => {
  try {
    // Intento 1: Con sesión actual (o login rápido si no hay cookie)
    await loginInterno(false);
    return await operacion();
  } catch (error: any) {
    // 🛑 Si es un error de negocio (ej: 404 Paciente no existe), NO reintentamos.
    if (
      error instanceof AppError &&
      error.statusCode !== 500 &&
      error.statusCode !== 502
    ) {
      throw error;
    }

    // 🕵️ Detección de sesión caída o error técnico del legacy
    const esErrorTecnico =
      error?.message === "Sesión expirada" ||
      error?.message?.includes("Respuesta inválida") ||
      error?.statusCode === 401 ||
      error?.statusCode === 502; // A veces el gateway da 502 si el backend corta la conexión

    if (esErrorTecnico) {
      console.warn(
        `⚠️ Sesión caída o error en '${descripcion}'. Reintentando con login fresco...`,
      );

      // Intento 2: Forzamos Login nuevo y reejecutamos
      await loginInterno(true);
      return await operacion();
    }

    // Si falló el reintento o es otro error desconocido, lanzamos.
    throw error;
  }
};

// ==========================================
// 🚀 SERVICIO PÚBLICO
// ==========================================

export const apiInternoService = {
  async obtenerPrestaciones(): Promise<IEstudioConfig[]> {
    // Aquí podrías filtrar solo los visibles si quisieras
    return estudiosData.filter((e) => e.visible !== false) as IEstudioConfig[];
    //return estudiosData as IEstudioConfig[];
  },

  async buscarPacienteInterno(
    numeroId: string,
    esHc: boolean = false,
  ): Promise<IPacienteInterno> {
    return ejecutarPeticionInterna("Buscar Paciente", async () => {
      const queryParam = esHc
        ? `Pacientes-Pacientes-Search1-pacienteid=${numeroId}`
        : `Pacientes-Pacientes-Search1-numerodocumento=${numeroId}`;

      const response = await internoApi.get(
        `/Hospital/Pacientes/Pacientes/ListarDetalle?${queryParam}`,
      );

      // Validación de respuesta válida (XML)
      const xmlData = response.data;
      if (!xmlData || typeof xmlData !== "string" || !xmlData.includes("<")) {
        throw new Error("Respuesta inválida"); // Dispara el retry del wrapper
      }

      const rawData = parser.parse(xmlData);

      // Extracción de datos (Búsqueda directa porque conocemos la estructura de este endpoint)
      let rowData = rawData?.Response?.Content?.Pacientes?.ResultSet?.Row;

      if (!rowData) {
        throw new AppError(
          "No se encontraron datos del paciente en la respuesta XML",
          404,
        );
      }

      // Manejo de duplicados (Array)
      if (Array.isArray(rowData)) {
        rowData = rowData[0];
      }

      return cleanPacienteInterno(rowData);
    });
  },

  async obtenerPlanillaDiariaId(
    idPaciente: string,
    sistema = SistemaConsumoInterno.guardia,
  ): Promise<string | null> {
    return ejecutarPeticionInterna("Obtener Planilla Diaria", async () => {
      const url = "/Hospital/Dimagenes/DimagenesTurnos/ListarHorarios";
      const tp = Date.now();

      const payload = new URLSearchParams();
      payload.append("tp", tp.toString());
      payload.append("servicioid", "0005");
      payload.append("seccionid", sistema.servicioId);
      payload.append("personalid", "20999999993");

      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
          Referer: `${process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4"}/Hospital/Dimagenes/DimagenesTurnos/only?pacienteid=${idPaciente}&tipoingreso=${sistema.letraServicio}profesional=0005.${sistema.servicioId}.20999999993&tp=${tp}`,
        },
      };

      const response = await internoApi.post(url, payload, config);
      const xmlData = response.data;

      if (!xmlData || typeof xmlData !== "string" || !xmlData.includes("<")) {
        throw new Error("Respuesta inválida"); // Dispara el retry del wrapper
      }

      //console.log("Datos crudos Planilla:", xmlData); // Descomentar para debug

      const rawData = parser.parse(xmlData);

      const planillaId = buscarValorRecursivo(rawData, "planilladiariaid");

      if (!planillaId) {
        console.warn(
          "No se encontró planilladiariaid para paciente:",
          idPaciente,
        );
        return null;
      }

      return planillaId.toString();
    });
  },

  async obtenerSistemaId(
    idPaciente: string,
    idCobertura: string,
    sistema: IConfigSistema,
    planillaDiariaId: string,
  ): Promise<string | null> {
    return ejecutarPeticionInterna("Obtener Sistema ID", async () => {
      const url = `/Hospital/Dimagenes/DimagenesTurnos/Insertar`;
      const tp = Date.now();
      const ahora = new Date();
      const dia = ahora.getDate().toString().padStart(2, "0");
      const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
      const anio = ahora.getFullYear();
      const fechaActual = `${dia}-${mes}-${anio}`;

      const hora = ahora.getHours().toString().padStart(2, "0");
      const minutos = ahora.getMinutes().toString().padStart(2, "0");
      const horaActual = `${hora}:${minutos}`;
      const payload = new URLSearchParams();
      payload.append("tp", tp.toString());
      payload.append(
        "Dimagenes-DimagenesTurnos-New-planilladiariaid",
        planillaDiariaId,
      );
      payload.append("Dimagenes-DimagenesTurnos-New-numeroturno", ""); // Requerido aunque vacío
      payload.append(
        "Dimagenes-DimagenesTurnos-New-profesionalid",
        `0005.${sistema.servicioId}.20999999993`,
      );
      payload.append("Dimagenes-DimagenesTurnos-New-diasemanaid", "");
      payload.append("Dimagenes-DimagenesTurnos-New-fecha", fechaActual);
      payload.append("Dimagenes-DimagenesTurnos-New-hora", horaActual);
      payload.append("Dimagenes-DimagenesTurnos-New-pacienteid", idPaciente);
      payload.append("Dimagenes-DimagenesTurnos-New-coberturaid", idCobertura);
      payload.append(
        "Dimagenes-DimagenesTurnos-New-tipoingreso",
        sistema.letraServicio,
      );
      payload.append("Dimagenes-DimagenesTurnos-New-derivadorid", "");
      payload.append(
        "Dimagenes-DimagenesTurnos-New-solicitante_profesionalid",
        "",
      );
      payload.append("Dimagenes-DimagenesTurnos-New-primeravez", "");
      payload.append("Dimagenes-DimagenesTurnos-New-observaciones", "");
      payload.append("Dimagenes-DimagenesTurnos-New-anulado_motivo", "");
      payload.append("Dimagenes-DimagenesTurnos-New-buscadorRapido", "");
      payload.append("Dimagenes-DimagenesTurnos-New-servicioid", "0005");
      payload.append(
        "Dimagenes-DimagenesTurnos-New-seccionid",
        sistema.servicioId,
      );
      payload.append("Dimagenes-DimagenesTurnos-New-personalid", "20999999993");
      payload.append("Dimagenes-DimagenesTurnos-New-sistema_solicitado", "");
      payload.append("Dimagenes-DimagenesTurnos-New-sistema_solicitado_id", "");
      payload.append(
        "Dimagenes-DimagenesTurnos-New-solicitante_servicioid",
        "",
      );
      payload.append(
        "Dimagenes-DimagenesTurnos-New-solicitante_seccionid",
        "undefined",
      ); // Ojo: string "undefined"
      payload.append(
        "Dimagenes-DimagenesTurnos-New-solicitante_personalid",
        "undefined",
      );

      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "http://10.101.0.4",
          Referer: `http://10.101.0.4/Hospital/Dimagenes/DimagenesTurnos?pacienteid=${idPaciente}`,
        },
      };

      const response = await internoApi.post(url, payload, config);
      const xmlData = response.data;

      if (!xmlData || typeof xmlData !== "string" || !xmlData.includes("<")) {
        throw new Error("Respuesta inválida al crear turno");
      }

      const rawData = parser.parse(xmlData);

      const turnoId = buscarValorRecursivo(rawData, "turnoid");

      if (!turnoId) {
        console.warn(
          "No se pudo obtener el turnoid (sistemaId) de la respuesta",
        );
        return null;
      }

      return turnoId.toString();
    });
  },

  async obtenerConsumoId(
    idPaciente: string,
    idCobertura: string,
    sistemaId: string,
    sistema: IConfigSistema,
  ): Promise<string | null> {
    return ejecutarPeticionInterna(
      "Obtener Consumo ID (Redirección)",
      async () => {
        const url = "/Hospital/Pacientes/PacientesConsumo/Cargar";

        const config = {
          params: {
            sistema: "Dimagenes",
            sistemaid: sistemaId,
            pacienteid: idPaciente,
            coberturaid: idCobertura,
          },
          headers: {
            Referer: `${process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4"}/Hospital/Dimagenes/DimagenesTurnos/only?pacienteid=${idPaciente}&tipoingreso=${sistema.letraServicio}&profesional=0005.${sistema.servicioId}.20999999993&sistema_solicitado=Dimagenes`,
          },
          // Evitar que Axios siga la redirección automática
          maxRedirects: 0,
          validateStatus: (status: number) => status >= 200 && status < 400,
        };

        const response = await internoApi.get(url, config);

        if (response.status === 302) {
          const location = response.headers["location"];

          if (!location) {
            console.warn("Respuesta 302 sin header Location");
            return null;
          }

          const baseUrl =
            process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4";
          const redirectUrl = new URL(location, baseUrl);

          const consumoId = redirectUrl.searchParams.get("consumoid");

          if (!consumoId) {
            console.warn("No se encontró 'consumoid' en la URL de redirección");
            return null;
          }

          return consumoId;
        }

        // Si el servidor responde 200 OK, significa que NO redirigió, algo falló en la lógica
        console.warn(
          `Se esperaba 302 Found, pero se recibió ${response.status}`,
        );
        return null;
      },
    );
  },

  async insertarConsumoInterno(
    consumoId: string,
    prestacionId: string,
    prestacionNombre: string,
    coberturaId: string,
    sistemaId: string,
  ): Promise<boolean> {
    return ejecutarPeticionInterna("Insertar Consumo (Detalle)", async () => {
      const url = "/Hospital/Pacientes/PacientesConsumoDetalles/Insertar";

      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const fechaHoy = `${day}-${month}-${year}`;

      const payload = new URLSearchParams();
      payload.append("tp", Date.now().toString());
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-consumoid",
        consumoId,
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-consumodetalleid",
        "",
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-prestacionid",
        prestacionId,
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-prestacionnombre",
        prestacionNombre,
      );
      payload.append("Pacientes-PacientesConsumoDetalles-New-cantidad", "1");
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-porcentaje",
        "100",
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-numerocomprobanteatencion",
        "",
      );
      payload.append("Pacientes-PacientesConsumoDetalles-New-honorarios", "");
      payload.append("Pacientes-PacientesConsumoDetalles-New-gastos", "");
      payload.append("Pacientes-PacientesConsumoDetalles-New-fecha", fechaHoy);
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-sistema",
        "Dimagenes",
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-sistemaid",
        sistemaId,
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-coberturaid",
        coberturaId,
      );
      payload.append("Pacientes-PacientesConsumoDetalles-New-estado", "");
      payload.append(
        "Pacientes-PacientesConsumoDetalles-New-anulado_motivo",
        "",
      );

      // 3. HEADERS ESPECIALES
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
          Referer: `${process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4"}/Hospital/Pacientes/PacientesConsumoDetalles/only?consumoid=${consumoId}&sistema=Dimagenes&sistemaid=${sistemaId}`,
          "X-Requested-With": "XMLHttpRequest",
          "X-Prototype-Version": "1.7.2",
        },
      };

      const response = await internoApi.post(url, payload, config);
      //console.log("Respuesta de insertar:", response.data);
      const responseData = response.data;

      // Verificación básica si respuesta contiene error
      if (
        typeof responseData === "string" &&
        responseData.toLowerCase().includes("error")
      ) {
        console.error("Error en respuesta del servidor:", responseData);
        throw new AppError(
          "El sistema interno rechazó la carga del consumo",
          400,
        );
      }

      return true;
    });
  },

  async confirmarConsumoInterno(
    consumoId: string,
    sistemaId: string,
  ): Promise<boolean> {
    return ejecutarPeticionInterna("Confirmar Consumo", async () => {
      const url = "/Hospital/Pacientes/PacientesConsumoDetalles/Confirmar";

      // 1. Construcción del Payload
      const payload = new URLSearchParams();
      payload.append("tp", Date.now().toString());
      payload.append(
        "Pacientes-PacientesConsumoDetalles-Confirmar-consumoid",
        consumoId,
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-Confirmar-sistema",
        "Dimagenes",
      );
      payload.append(
        "Pacientes-PacientesConsumoDetalles-Confirmar-sistemaid",
        sistemaId,
      );

      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
          Referer: `${process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4"}/Hospital/Pacientes/PacientesConsumoDetalles/only?consumoid=${consumoId}&sistema=Dimagenes&sistemaid=${sistemaId}`,
          "X-Requested-With": "XMLHttpRequest",
          "X-Prototype-Version": "1.7.2",
        },
      };

      const response = await internoApi.post(url, payload, config);

      const responseData = response.data;
      if (
        typeof responseData === "string" &&
        responseData.toLowerCase().includes("error")
      ) {
        console.error("Error al confirmar consumo:", responseData);
        throw new AppError(
          "El sistema rechazó la confirmación del consumo",
          400,
        );
      }

      return true;
    });
  },

  async crearLoteConsumos(
    idPacienteRaw: string,
    idCoberturaRaw: string,
    items: IConsumoItem[],
    sistema: IConfigSistema, // El objeto { letraServicio: "G", ... }
  ): Promise<{ consumoId: string; resultados: IResultadoLote[] }> {
    // Envolvemos TODO el proceso en una sola sesión garantizada
    return ejecutarPeticionInterna("Procesar Lote Completo", async () => {
      // PASO 1: Obtener ID de Planilla Diaria
      // (Si falla aquí, abortamos todo)
      const idPaciente = String(idPacienteRaw).padStart(11, "0");
      const idCoberturaReal = String(idCoberturaRaw).padStart(5, "0");
      const COBERTURA_PARTICULAR = "09999";
      const planillaId = await apiInternoService.obtenerPlanillaDiariaId(
        idPaciente,
        sistema,
      );
      if (!planillaId) {
        throw new AppError(
          "Error interno: No se pudo obtener la Planilla Diaria.",
          500,
        );
      }

      // PASO 2: Generar/Obtener Turno (Sistema ID)
      const sistemaId = await apiInternoService.obtenerSistemaId(
        idPaciente,
        idCoberturaReal,
        sistema,
        planillaId,
      );

      if (!sistemaId) {
        throw new AppError(
          "Error interno: No se pudo generar el Turno (SistemaID).",
          500,
        );
      }

      // PASO 3: Obtener la Cabecera de Consumo (Consumo ID)
      const consumoId = await apiInternoService.obtenerConsumoId(
        idPaciente,
        idCoberturaReal,
        sistemaId,
        sistema,
      );
      if (!consumoId) {
        throw new AppError(
          "Error interno: No se pudo obtener el ID de Consumo.",
          500,
        );
      }

      // PASO 4: Inserción de Ítems (Bucle) try catch para captar errores y guardarlos en resultado lote
      const resultados: IResultadoLote[] = [];

      for (const item of items) {
        let insertado = false;
        let errorDetalle = "";

        // ---------------------------------------------------------
        // INTENTO 1: Con la Obra Social Real
        // ---------------------------------------------------------
        try {
          if (idCoberturaReal !== COBERTURA_PARTICULAR) {
            console.log(
              `Intentando insertar '${item.nombre}' con cobertura ${idCoberturaReal}...`,
            );
            insertado = await apiInternoService.insertarConsumoInterno(
              consumoId,
              item.id,
              item.nombre,
              idCoberturaReal,
              sistemaId,
            );
          }
        } catch (error: any) {
          console.warn(`Falló intento con OS: ${error.message}`);
          // No marcamos error fatal todavía, vamos al Plan B
        }

        // INTENTO 2 (Plan B): Fallback a Particular

        if (!insertado) {
          // Solo reintentamos si no estamos ya en particular (para evitar bucle infinito si falla particular también)
          const esReintento = idCoberturaReal !== COBERTURA_PARTICULAR;

          if (esReintento) {
            console.log(
              `🔄 Reintentando '${item.nombre}' como Particular (09999)...`,
            );
          }

          try {
            insertado = await apiInternoService.insertarConsumoInterno(
              consumoId,
              item.id,
              item.nombre,
              COBERTURA_PARTICULAR, // <--- Forzamos 09999
              sistemaId,
            );
          } catch (error: any) {
            console.error(`Falló también como particular: ${error.message}`);
            errorDetalle = error.message;
          }
        }

        // ---------------------------------------------------------
        // Registro del Resultado
        // ---------------------------------------------------------
        if (insertado) {
          resultados.push({ prestacion: item.nombre, exito: true });
        } else {
          resultados.push({
            prestacion: item.nombre,
            exito: false,
            error:
              errorDetalle || "Rechazado por el sistema (Bloqueo de cobertura)",
          });
        }
      }

      // PASO 5: Confirmación Final
      // Solo confirmamos si al menos uno se insertó correctamente
      const algunExito = resultados.some((r) => r.exito);

      if (algunExito) {
        await apiInternoService.confirmarConsumoInterno(consumoId, sistemaId);
      } else {
        console.warn(
          "No se confirmó el consumo porque ningún ítem se insertó correctamente.",
        );
      }

      return { consumoId, resultados };
    });
  },
};
