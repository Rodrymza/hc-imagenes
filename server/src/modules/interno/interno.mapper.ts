import {
  IPacienteInterno,
  IPacienteInternoRaw,
  ICoberturaRaw,
  IPacienteInternado,
} from "./interno.types";

import * as cheerio from "cheerio";

/**
 * Convierte fecha formato "DD-MM-YYYY" a objeto Date JS
 */
const parseFechaArgentina = (fechaStr: string | null): Date | null => {
  if (!fechaStr) return null;
  const partes = fechaStr.split("-"); // [07, 09, 1991]
  if (partes.length !== 3) return null;

  // Mes en JS empieza en 0 (Enero=0), por eso restamos 1
  return new Date(
    parseInt(partes[2]),
    parseInt(partes[1]) - 1,
    parseInt(partes[0]),
  );
};

/**
 * Calcula edad precisa
 */
const calcularEdad = (fechaNac: Date): number => {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const m = hoy.getMonth() - fechaNac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  return edad;
};

export const cleanPacienteInterno = (
  raw: IPacienteInternoRaw,
): IPacienteInterno => {
  // 1. Manejo de Nombres
  const apellido = `${raw.apellido1 || ""} ${raw.apellido2 || ""}`.trim();
  const nombre = `${raw.nombre1 || ""} ${raw.nombre2 || ""}`.trim();

  // 2. Manejo de Fecha
  const fechaNac = parseFechaArgentina(raw.fechanacimiento);
  const edad = fechaNac ? calcularEdad(fechaNac) : 0;

  // 3. Manejo de Telefonos (Prioridad: Celular > Fijo > Otros)
  const telCelular = raw.telefonocelular
    ? `${raw.telefonocelularprefijo || ""}-${raw.telefonocelular}`
    : "";
  const telFijo = raw.telefonocasa
    ? `${raw.telefonocasaprefijo || ""}-${raw.telefonocasa}`
    : "";
  const telefonoFinal = telCelular || telFijo || "Sin teléfono";

  // 4. Manejo de Coberturas (Aseguramos que sea array)
  // El parser XML a veces devuelve objeto único si hay solo una, o array si hay varias.
  // Tu parser 'isArray' ya ayuda, pero por seguridad hacemos esto:
  let rawCoberturas: ICoberturaRaw[] = [];
  if (Array.isArray(raw.coberturas)) {
    rawCoberturas = raw.coberturas;
  } else if (raw.coberturas) {
    rawCoberturas = [raw.coberturas];
  }

  const coberturasClean = rawCoberturas.map((c) => ({
    nombre: c.nombre?.trim() || "Obra Social",
    sigla: c.sigla?.trim() || "",
    idCobertura: c.coberturaid || "idCobertura no encontrado",
    numeroCarnet: String(c.carnetnumero || "").trim() || "S/N",
    tipo: c.tipobeneficiarionombre?.trim() || "Afiliado",
  }));

  return {
    idPaciente: raw.pacienteid,
    dni: raw.numerodocumento,
    dniString: parseInt(raw.numerodocumento).toLocaleString("ES-AR"),
    apellidos: apellido,
    nombres: nombre,
    nombreCompleto: `${apellido}, ${nombre}`,
    fechaNacimiento: fechaNac,
    fechaNacimientoString: raw.fechanacimiento || "Sin datos", // Dejamos el string original para mostrar rápido
    edad: edad,
    sexo: raw.sexoid || "Desconocido",
    domicilio: `${raw.domicilio || ""}, ${raw.localidadnombre || ""}`.trim(),
    contacto: {
      telefono: telefonoFinal,
      email: raw.email || "Sin email",
    },
    coberturas: coberturasClean,
  };
};

export const formatearPacientesInternados = (
  htmlPacientes: string,
): IPacienteInternado[] => {
  const pacientesJSON: IPacienteInternado[] = [];

  // 1. Cargamos el HTML crudo en el motor de Cheerio
  const $ = cheerio.load(htmlPacientes);

  // 2. Iteramos sobre cada fila de la tabla
  $('tr[id^="egresos-fila"]').each((_, tr) => {
    const $tr = $(tr); // Convertimos la fila actual en un objeto Cheerio

    // Extraemos el texto del paciente directamente
    const textoPaciente = $tr.find('span[id$="-paciente"]').text().trim();

    // Si la fila está vacía o no tiene paciente, pasamos a la siguiente
    if (!textoPaciente) return;

    // Separamos la HC del nombre (usando tu misma lógica elegante)
    const [historiaClinica, ...restoNombre] = textoPaciente
      .split("-")
      .map((t) => t.trim());
    const nombreCompleto = restoNombre.join("-").trim();

    // Extraemos el resto de los campos (Si el span no existe, .text() devuelve "")
    const sala =
      $tr.find('span[id$="-sala"]').text().split(" ")[0]?.trim() || "";
    const cama =
      $tr.find('span[id$="-cama"]').text().split(" ")[0]?.trim() || "";
    const servicio = $tr.find('span[id$="-servicio"]').text().trim();
    const informeId = $tr.find('span[id$="-informeid"]').text().trim();

    // Armamos el objeto final
    pacientesJSON.push({
      historia_clinica: historiaClinica,
      nombre_apellido: nombreCompleto,
      servicio: servicio,
      sala: sala && cama ? `${sala}-${cama}` : sala || cama,
      informe_id: informeId,
    });
  });

  return pacientesJSON;
};
