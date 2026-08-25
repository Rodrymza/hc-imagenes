import { Eye, CalendarClock, AlertCircle } from "lucide-react";
import type { PedidoCardData } from "@/types/pedidoCard";
import { getEstadoEstilo, getEstiloEstudio, getLugarEstilo } from "./utils";

interface PedidoCardProps {
  item: PedidoCardData;
  accentColor: "emerald" | "red";
  onVerDetalle: () => void;
  onToggleEstado?: () => void;
  buttonLabel?: string;
}

export const PedidoCard = ({
  item,
  accentColor,
  onVerDetalle,
  onToggleEstado,
  buttonLabel = "Ver Detalle",
}: PedidoCardProps) => {
  const estiloEstudio = getEstiloEstudio(item.studyType);
  const estiloLugar = getLugarEstilo(item.location);
  const estiloEstado = getEstadoEstilo(item.status === "realizado");

  const stripeColor =
    accentColor === "emerald" ? "bg-emerald-500/80" : "bg-red-500/80";

  return (
    <div
      className={`relative bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Stripe izquierda */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor}`} />

      <div className="pl-4 pr-3 py-3">
        {/* Fila superior: badge estudio + hora + urgente */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`inline-block w-fit px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide ${estiloEstudio.badge}`}
          >
            {item.studyType}
          </span>

          <div className="flex items-center gap-2">
            {item.isUrgent && (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-600 dark:text-red-400 animate-pulse bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900">
                URGENTE
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarClock className="w-3 h-3" />
              <span className="font-mono">{item.time}</span>
            </div>
          </div>
        </div>

        {/* Paciente */}
        <h3 className="font-black text-foreground text-base leading-tight mb-0.5">
          {item.patientName}
        </h3>
        <span className="inline-block text-[11px] tracking-wider bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground font-medium mb-2">
          DNI: {item.dni}
        </span>

        {/* Estudio */}
        <p className="font-semibold text-sm text-foreground leading-snug mb-1 whitespace-pre-line">
          {item.studyDescription}
        </p>

        {/* Diagnóstico */}
        {item.diagnosis && (
          <p className="text-xs text-muted-foreground italic truncate border-l-2 border-emerald-200 dark:border-emerald-800 pl-2 mb-2">
            {item.diagnosis}
          </p>
        )}

        {/* Ubicación */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-semibold uppercase ${estiloLugar.bg}`}
          >
            {estiloLugar.icon}
            {item.location}
          </div>
          {item.subLocation && (
            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-lg text-[10px] font-black border border-indigo-200 dark:border-indigo-800">
              {item.subLocation}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={onVerDetalle}
              className="flex items-center justify-center gap-1.5 flex-1 w-full px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground font-semibold text-[11px] uppercase tracking-wider transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 dark:hover:border-blue-800 active:scale-95 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={3} />
              <span>{buttonLabel}</span>
            </button>
            {item.hasNotification && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-white border-2 border-white flex items-center justify-center shadow-md shadow-amber-400">
                <AlertCircle className="w-2 h-2" strokeWidth={3} />
              </span>
            )}
          </div>

          {onToggleEstado && item.status && (
            <button
              onClick={onToggleEstado}
              title={
                item.status === "realizado"
                  ? "Marcar como Pendiente"
                  : "Marcar como Finalizado"
              }
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-[11px] tracking-wide transition-all active:scale-95 shadow-sm ${estiloEstado.badge} ${estiloEstado.hover}`}
            >
              <span>{estiloEstado.label}</span>
              {estiloEstado.icon}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
