import { useEffect, useState } from "react";
import { Clock, Timer, AlertTriangle, CalendarClock } from "lucide-react";
import { calcularDemora } from "./demoraUtils";
import type { ResultadoDemora } from "./demoraUtils";

interface TiempoDemoraProps {
  fechaCreacion: string;
  finalizado?: boolean;
  tipoEstudio?: string;
  lugar?: string;
  urgente?: string;
  solicitud?: string;
}

const estilos = {
  ok: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    icon: <Clock className="w-3 h-3" />,
  },
  warning: {
    bg: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800",
    icon: <Clock className="w-3 h-3" />,
  },
  alerta: {
    bg: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    icon: <Timer className="w-3 h-3" />,
  },
  critico: {
    bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 animate-pulse",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

function formatearTiempo(resultado: ResultadoDemora): string {
  if (resultado.perfil === "programado" && resultado.programadoPara) {
    const hh = resultado.programadoPara.getHours().toString().padStart(2, "0");
    const mm = resultado.programadoPara
      .getMinutes()
      .toString()
      .padStart(2, "0");
    if (resultado.horas === 0 && resultado.minutos === 0) {
      return `Programado ${hh}:${mm}`;
    }
    const restante =
      resultado.horas > 0
        ? `${resultado.horas}h ${resultado.minutos}m`
        : `${resultado.minutos}m`;
    return `${restante} para ${hh}:${mm}`;
  }

  if (resultado.horas > 0) {
    return `${resultado.horas}h ${resultado.minutos}m`;
  }
  return `${resultado.minutos}m`;
}

export const TiempoDemora = ({
  fechaCreacion,
  finalizado,
  tipoEstudio,
  lugar,
  urgente,
  solicitud,
}: TiempoDemoraProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const resultado = calcularDemora(fechaCreacion, {
    tipoEstudio,
    lugar,
    urgente,
    solicitud,
    finalizado,
  });

  if (!resultado) return null;

  const estilo =
    resultado.perfil === "programado" ? estilos.ok : estilos[resultado.nivel];

  const icono =
    resultado.perfil === "programado" ? (
      <CalendarClock className="w-3 h-3" />
    ) : (
      estilo.icon
    );

  const texto = formatearTiempo(resultado);

  return (
    <span
      className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-sm font-mono font-bold w-full ${estilo.bg}`}
      title={`Demora: ${texto} | Perfil: ${resultado.perfil}`}
    >
      {icono}
      {` Hace ${texto}`}
    </span>
  );
};
