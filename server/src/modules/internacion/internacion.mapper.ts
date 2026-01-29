import { formatearFecha } from "../../utils/date.utils";
import { capitalize } from "../../utils/string.utils";
import { IPedidoInternacion } from "./internacion.types";
import { obtenerTipoEstudio } from "./utils/estudio.utils";
import {
  obtenerFechaHoraIngreso,
  obtenerSala,
} from "./utils/internacion.utils";
import { obtenerDatosPacienteInternacion } from "./utils/paciente.utils";

export function mapearPedidoInternacion(apiEstudio: any): IPedidoInternacion {
  // === IDs ===
  const idEstudio = apiEstudio?._id || "Sin id";
  const idMovimiento = apiEstudio?.comentarios?._id || null;

  // === PACIENTE ===
  const datosPaciente = obtenerDatosPacienteInternacion(
    apiEstudio?.paciente_a_la_fecha,
  );

  const fechaNacimiento = formatearFecha(
    apiEstudio?.paciente_a_la_fecha?.nacimiento,
    false,
  );

  // === ESTUDIO ===
  const fecha = formatearFecha(apiEstudio?.fecha, true);
  const fechaIso = apiEstudio?.fecha || "Sin ISO Date";

  const diagnostico =
    apiEstudio?.movimiento?.diagnostico1?.termino || "Sin diagnóstico";

  const solicitud = apiEstudio?.movimiento?.detalle || "Sin solicitud";

  const tipoEstudio =
    obtenerTipoEstudio(apiEstudio?.movimiento?.detalle) || "Otro";

  const solicitudLower = solicitud.toLowerCase();
  const esTac =
    solicitudLower.includes("tomogra") ||
    solicitudLower.includes("tac ") ||
    solicitudLower.includes("tc");

  const lugar = esTac
    ? "Tomógrafo"
    : capitalize(
        apiEstudio?.movimiento?.lugar_realizacion?.replace("_", " "),
      ) || "No especificado";

  const urgente = apiEstudio?.movimiento?.urgente || "No";

  const solicitante = (() => {
    const nombre = capitalize(apiEstudio?.legajo_a_la_fecha?.nombre)
      ?.split(" ")[0]
      ?.trim();

    const apellido = capitalize(
      apiEstudio?.legajo_a_la_fecha?.apellido,
    )?.trim();

    if (!nombre && !apellido) return "Sin solicitante";
    return `${apellido || ""}, ${nombre || ""}`.trim();
  })();

  const servicio =
    capitalize(apiEstudio?.legajo_a_la_fecha?.servicio_nombre) ||
    "Sin servicio";

  // === INTERNACIÓN ===
  const infoInternacion = apiEstudio?.internacion_a_la_fecha;

  const sala = obtenerSala(infoInternacion);
  const fechaHoraIngreso = obtenerFechaHoraIngreso(infoInternacion);

  // === COMENTARIOS ===
  const comentario = apiEstudio?.comentarios?.comentario?.dimagenes || "";

  const nota = apiEstudio?.comentarios?.comentario?.enfermeria || "";

  // === RESULTADO FINAL ===
  return {
    idEstudio,
    idMovimiento,

    ...datosPaciente,
    fechaNacimiento,

    fecha,
    fechaIso,
    diagnostico,
    tipoEstudio,
    solicitud,
    lugar,
    urgente,
    solicitante,
    servicio,

    sala,
    fechaHoraIngreso,

    comentario,
    nota,
  };
}
