export type NivelDemora = "ok" | "warning" | "alerta" | "critico";
export type PerfilDemora =
  | "programado"
  | "flexible"
  | "base"
  | "estricto"
  | "ultraestricto";

interface ContextoPedido {
  tipoEstudio?: string;
  lugar?: string;
  urgente?: string;
  solicitud?: string;
  finalizado?: boolean;
}

export interface ResultadoDemora {
  nivel: NivelDemora;
  horas: number;
  minutos: number;
  perfil: PerfilDemora;
  programadoPara?: Date;
}

// --- Parsing de hora programada ---

const RE_REALIZAR =
  /realizar\s+(?:a\s+las\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(?:am|pm|hs|h)?/i;

export function detectarHoraProgramada(
  solicitud: string
): Date | null {
  const match = solicitud.match(RE_REALIZAR);
  if (!match) return null;

  let hora = parseInt(match[1], 10);
  const minutos = match[2] ? parseInt(match[2], 10) : 0;

  const textoCompleto = match[0].toLowerCase();
  if (textoCompleto.includes("pm") && hora < 12) {
    hora += 12;
  }
  if (textoCompleto.includes("am") && hora === 12) {
    hora = 0;
  }

  if (hora < 0 || hora > 23 || minutos < 0 || minutos > 59) return null;

  const ahora = new Date();
  const programado = new Date(ahora);
  programado.setHours(hora, minutos, 0, 0);

  return programado;
}

// --- Detección de Radiografía de Control ---

function esRadiografiaControl(
  tipoEstudio?: string,
  solicitud?: string
): boolean {
  if (!tipoEstudio || !solicitud) return false;
  return (
    tipoEstudio === "Radiografia" && /\bcontrol\b/i.test(solicitud)
  );
}

// --- Detección de servicios externos (paciente debe ser trasladado) ---

function esServicioExterno(lugar?: string): boolean {
  if (!lugar) return false;
  const l = lugar.toLowerCase();
  return l.includes("rayos") || l.includes("tomografo");
}

// --- Detección de "En Cama" ---

function esEnCama(lugar?: string): boolean {
  return !!lugar && /\ben\s*cama\b/i.test(lugar);
}

// --- Umbrales por perfil (en milisegundos) ---

const UMBRALES_POR_PERFIL: Record<
  PerfilDemora,
  { ok: number; warning: number; alerta: number }
> = {
  programado: {
    ok: 0,
    warning: 30 * 60 * 1000,
    alerta: 60 * 60 * 1000,
  },
  flexible: {
    ok: 60 * 60 * 1000,
    warning: 2 * 60 * 60 * 1000,
    alerta: 4 * 60 * 60 * 1000,
  },
  base: {
    ok: 30 * 60 * 1000,
    warning: 60 * 60 * 1000,
    alerta: 2 * 60 * 60 * 1000,
  },
  estricto: {
    ok: 15 * 60 * 1000,
    warning: 30 * 60 * 1000,
    alerta: 60 * 60 * 1000,
  },
  ultraestricto: {
    ok: 10 * 60 * 1000,
    warning: 20 * 60 * 1000,
    alerta: 45 * 60 * 1000,
  },
};

function determinarPerfil(contexto: ContextoPedido): PerfilDemora {
  const { tipoEstudio, lugar, urgente, solicitud } = contexto;

  if (
    esRadiografiaControl(tipoEstudio, solicitud) ||
    esServicioExterno(lugar)
  ) {
    return "flexible";
  }

  const esUrgente = urgente?.toLowerCase() === "si";
  const enCama = esEnCama(lugar);

  if (esUrgente && enCama) return "ultraestricto";
  if (esUrgente || enCama) return "estricto";
  return "base";
}

function calcularNivel(
  diffMs: number,
  perfil: PerfilDemora
): NivelDemora {
  const umbrales = UMBRALES_POR_PERFIL[perfil];
  if (diffMs <= umbrales.ok) return "ok";
  if (diffMs <= umbrales.warning) return "warning";
  if (diffMs <= umbrales.alerta) return "alerta";
  return "critico";
}

// --- Función principal ---

export function calcularDemora(
  fechaCreacion: string,
  contexto?: ContextoPedido
): ResultadoDemora | null {
  const inicio = new Date(fechaCreacion);
  if (isNaN(inicio.getTime())) return null;

  if (contexto?.finalizado) return null;

  const ahora = Date.now();
  const diffTotalMs = ahora - inicio.getTime();
  if (diffTotalMs < 0) return null;

  if (diffTotalMs > 86400000) return null;

  const programadoPara = contexto?.solicitud
    ? detectarHoraProgramada(contexto.solicitud)
    : null;

  let perfil: PerfilDemora;
  let diffMs: number;

  if (programadoPara) {
    const ahoraDate = new Date(ahora);

    if (ahoraDate < programadoPara) {
      const diffHastaProgramado = programadoPara.getTime() - ahora;
      const totalMin = Math.floor(diffHastaProgramado / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return {
        nivel: "ok",
        horas: h,
        minutos: m,
        perfil: "programado",
        programadoPara,
      };
    }

    perfil = determinarPerfil(contexto ?? {});
    diffMs = ahora - programadoPara.getTime();
  } else {
    perfil = determinarPerfil(contexto ?? {});
    diffMs = diffTotalMs;
  }

  const totalMinutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return {
    nivel: calcularNivel(diffMs, perfil),
    horas,
    minutos,
    perfil,
    programadoPara: programadoPara ?? undefined,
  };
}
