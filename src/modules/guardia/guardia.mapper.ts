import { formatearFecha } from "../../utils/date.utils";
import { capitalize } from "../../utils/string.utils";
import {
  IDatosPacienteGuardia,
  IDetallePedidoGuardia,
  IHsiRawPedido,
  IPedidoGuardia,
  IRawDetallePedido,
} from "./guardia.types";
import { calcularEdad, crearFecha, definirTipoEstudio } from "./guardia.utils";

export const cleanPacienteGuardia = (
  apiPaciente: any
): IDatosPacienteGuardia => {
  const idPaciente = apiPaciente?.id || "Sin id";
  const apellido = apiPaciente?.lastName.toUpperCase() || "Sin apellido";
  const nombres =
    `${capitalize(apiPaciente?.firstName)} ${capitalize(
      apiPaciente.middleNames
    )}` || "Sin nombres";
  const dni = apiPaciente?.identificationNumber || "Sin DNI";
  const dniString = dni.toLocaleString("es-AR") || "Sin DNI";
  const fechaNacimiento = new Date(apiPaciente?.birthDate) || null;
  const fechaNacimientoString = formatearFecha(fechaNacimiento, false);
  const edad = apiPaciente.personAge?.years || "Sin edad";
  return {
    idPaciente,
    dni,
    dniString,
    apellido,
    nombres,
    fechaNacimiento,
    fechaNacimientoString,
    edad,
  };
};

export const cleanPedidoListaHsi = (
  apiPedido: IHsiRawPedido
): IPedidoGuardia => {
  // 1. Procesamiento de Fechas
  const fechaObjeto = crearFecha(
    apiPedido.createdDate?.date,
    apiPedido.createdDate?.time
  );
  const fechaString = fechaObjeto
    ? formatearFecha(fechaObjeto, true)
    : "Sin fecha";

  // 2. Descripción y Tipo
  const descripcion = apiPedido.snomed?.[0]?.pt || "Sin descripción";
  const tipoEstudio = definirTipoEstudio(descripcion);

  // 3. Datos del Paciente
  const pacienteRaw = apiPedido.patientDto;
  const fechaNac = crearFecha(pacienteRaw?.birthDate);

  const ubicacion = (() => {
    if (apiPedido.patientLocation) {
      const detalle =
        apiPedido.patientLocation.roomNumber ||
        apiPedido.patientLocation.shockroom ||
        "Sin detalle";
      return `${apiPedido.patientLocation.sector} - ${detalle}`;
    }
    return "Sala de espera";
  })();

  return {
    idEstudio: apiPedido.studyId || "Sin id",
    fecha: fechaObjeto,
    fechaString,
    descripcion,
    tipoEstudio,
    idPaciente: pacienteRaw?.id || "Sin id",
    apellido: pacienteRaw?.lastName || "Sin apellido",
    nombre: pacienteRaw?.firstName
      ? capitalize(pacienteRaw.firstName)
      : "Sin nombre",
    dni: pacienteRaw?.identificationNumber
      ? parseInt(pacienteRaw.identificationNumber)
      : 0,
    sexo: pacienteRaw?.gender?.description || "Sin sexo",
    fechaNacimiento: fechaNac,
    fechaNacimientoString: fechaNac ? formatearFecha(fechaNac) : "Sin fecha",
    edad: pacienteRaw?.birthDate
      ? calcularEdad(
          pacienteRaw.birthDate.day,
          pacienteRaw.birthDate.month,
          pacienteRaw.birthDate.year
        )
      : "Sin Edad",
    ubicacion,
  };
};

export const cleanDetallePedidoGuardia = (
  apiPedido: IRawDetallePedido
): IDetallePedidoGuardia => {
  const idEstudio = apiPedido.diagnosticReportId.toString() || "Sin id";

  const fecha = formatearFecha(apiPedido.creationDate, true);
  const pedido = apiPedido.snomed || "Sin pedido";
  const diagnostico = apiPedido.healthCondition || "Sin diagnóstico";
  const observaciones =
    capitalize(apiPedido.observationsFromServiceRequest?.trim()) ||
    "Sin observaciones";
  const tipoEstudio = (() => {
    let tipo = definirTipoEstudio(observaciones);
    if (tipo == "Otros") {
      tipo = definirTipoEstudio(pedido);
    }
    return tipo;
  })();
  const lugar = capitalize(apiPedido.source || "Sin lugar");
  const doctor = (() => {
    const nombre = capitalize(apiPedido.doctor?.firstName) || "Sin nombre";
    const apellido = capitalize(apiPedido.doctor?.lastName) || "Sin apellido";
    return `${apellido}, ${nombre}`;
  })();
  const realizado = apiPedido.status || false;

  return {
    idEstudio,
    fecha,
    pedido,
    diagnostico,
    observaciones,
    tipoEstudio,
    lugar,
    doctor,
    realizado,
  };
};
