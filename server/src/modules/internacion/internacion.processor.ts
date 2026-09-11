import { IPedidoInternacion } from "./internacion.types.js";
import { enviarNotificacionTelegram } from "../telegram/telegram.service.js";
import { internacionService } from "./utils/internacion.factory.js";
import { getConfigNotificaciones } from "./internacion.notificaciones.config.js";

const MAX_RETRIES = 3;
const DELAY_RETRY = 1500;

const SALAS_EXCLUIDAS = ["445", "441", "417", "470"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const esSalaExcluida = (sala: string) => {
  if (!sala) return false;

  const numero = sala.match(/\d+/)?.[0];

  return numero ? SALAS_EXCLUIDAS.includes(numero) : false;
};

// --- LÓGICA DE NEGOCIO ---

const esParaNotificar = (estudio: IPedidoInternacion): boolean => {
  const config = getConfigNotificaciones();

  if (config.ENVIOS_DESACTIVADOS) {
    return false;
  }

  const tipoLower = estudio.tipoEstudio?.toLowerCase() ?? "";
  if (!tipoLower.includes("radiogra")) {
    return false;
  }

  if (esSalaExcluida(estudio.sala) && config.EXCLUIR_TERAPIAS) {
    return false;
  }

  const hoy = new Date().getDay();
  if (!config.DIAS_PERMITIDOS.includes(hoy)) return false;

  const lugarActual = estudio.lugar?.toLowerCase() || "";
  if (!lugarActual.includes("en cama")) return false;

  // Regla 2: Horario
  try {
    const horaStr = estudio.fecha.split(" ")[1]?.split(":")[0];
    const hora = Number(horaStr);

    if (isNaN(hora)) return false;

    return hora >= config.HORA_INICIO && hora < config.HORA_FIN;
  } catch (e) {
    console.error("Error parseando fecha para notificación", e);
    return false;
  }
};

const crearComentarioAutomatico = (estudio: IPedidoInternacion): string => {
  const tipoLower = estudio.tipoEstudio.toLowerCase();
  const lugar = estudio.lugar || "";

  if (tipoLower.includes("tomogra")) return "TAC";
  if (tipoLower.includes("radiogra")) return `RX ${lugar}`;
  if (tipoLower.includes("eco")) return `ECO ${lugar}`;

  return "No especificado";
};

const armarMensajeTelegram = (estudio: IPedidoInternacion): string => {
  // Template Strings hacen esto más legible
  return `
🚨 SOLICITUD DE ESTUDIO URGENTE

🛏️ Sala: ${estudio.sala || "Sin sala"}
📍 Lugar: ${estudio.lugar}
🕐 Fecha: ${estudio.fecha}

👤 Paciente
Apellido y nombre: ${estudio.apellidos}, ${estudio.nombres}
DNI: ${estudio.dniString}
Fecha de Nacimiento: ${estudio.fechaNacimiento}

🩻 Estudio solicitado
${estudio.solicitud.replace(/<br\s*\/?>/gi, "\n")}

📝 Diagnóstico
${estudio.diagnostico || "No especificado"}
`.trim();
};

const enviarConRetry = async (mensaje: string) => {
  for (let intento = 1; intento <= MAX_RETRIES; intento++) {
    try {
      await enviarNotificacionTelegram(mensaje);
      console.log("✅ Telegram enviado OK");
      return;
    } catch (error: any) {
      console.warn(`🚩 Telegram fallo intento ${intento}: ${error.message}`);
      if (intento === MAX_RETRIES) {
        console.error("⛔ Telegram fallo definitivo");
      } else {
        await sleep(DELAY_RETRY * intento);
      }
    }
  }
};

export const procesarEstudiosBackend = async (
  estudios: IPedidoInternacion[],
) => {
  if (!estudios || estudios.length === 0) {
    console.error("No hay estudios para procesar");
    return estudios; // Devolvemos el array vacío para no romper el frontend
  }

  let mensajesAEnviar = [];

  for (const estudio of estudios) {
    const tieneComentario = estudio.comentario.trim() != "";

    if (tieneComentario) continue;

    const comentarioAuto = crearComentarioAutomatico(estudio);

    if (esParaNotificar(estudio)) {
      console.log(
        `✅ Para notificar \nComentario automatico ${comentarioAuto}`,
      );
      try {
        const mensajeTelegram = armarMensajeTelegram(estudio);
        mensajesAEnviar.push(mensajeTelegram);
      } catch (error: any) {
        console.error("Error armando mensaje Telegram:", error.message);
      }
    }

    const id_movimiento =
      estudio.idMovimiento === null ? "null" : estudio.idMovimiento;

    // 1. Envío de comentario en segundo plano
    internacionService
      .guardarComentario(
        estudio.idEstudio,
        id_movimiento,
        comentarioAuto,
        estudio.nota,
      )
      .then(() => console.log("Comentario automatico enviado correctamente"))
      .catch((error: any) => {
        console.warn(
          `⚠️ Error guardando comentario (Estudio ${estudio.idEstudio}): El hospital rechazó el dato o hubo un fallo de red.`,
        );
      });
  }

  // 🔥 2. Envío de notificaciones en segundo plano AQUÍ
  if (mensajesAEnviar.length > 0) {
    enviarMensajesPendientes(mensajesAEnviar).catch((err) =>
      console.error(
        "Error enviando notificaciones Telegram en background:",
        err,
      ),
    );
  }

  return estudios;
};

export const enviarMensajesPendientes = async (mensajes: string[]) => {
  console.log(
    `🚀 Iniciando envío de ${mensajes.length} notificaciones en segundo plano...`,
  );

  for (const msj of mensajes) {
    try {
      await enviarConRetry(msj);

      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      // Logueamos pero no cortamos el bucle, que siga con el siguiente mensaje
      console.error("Fallo envío de mensaje individual:", error);
    }
  }
};
