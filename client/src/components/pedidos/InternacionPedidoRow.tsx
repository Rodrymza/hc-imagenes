import type { IPedidoInternacion } from "@/types/pedidos";
import { Eye, CalendarClock, AlertCircle } from "lucide-react";
import {
  capitalize,
  getEstadoEstilo,
  getEstiloEstudio,
  getLugarEstilo,
} from "./utils";

interface PedidoRowProps {
  item: IPedidoInternacion;
  onVerDetalle: (item: IPedidoInternacion) => void;
  onToggleEstado?: (item: IPedidoInternacion) => void; // Opcional (para Guardia)
}

export const InternacionPedidoRow = ({
  item,
  onVerDetalle,
  onToggleEstado,
}: PedidoRowProps) => {
  // Procesamiento de datos visuales
  const [dia, hora] = item.fecha.split(" ");
  const solicitudLimpia = item.solicitud;
  const estiloLugar = getLugarEstilo(item.lugar);
  const esUrgente = item.urgente?.toLowerCase() === "si";
  const isFinalizado =
    item.comentario.toLocaleLowerCase().includes("ok") ||
    item.comentario.toLocaleLowerCase().includes("realiz");
  const estiloEstado = getEstadoEstilo(isFinalizado);

  return (
    <tr className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors group border-border last:border-0">
      {/* 1. FECHA */}
      <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
        <div className="flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4 text-emerald-600/50" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-700 text-lg">{dia}</span>
            <span className="text-base text-slate-400 font-mono">
              {hora} hs
            </span>
          </div>
        </div>
      </td>

      {/* 2. PACIENTE */}
      <td className="px-6 py-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="font-black text-foreground pb-2 md:tracking-tight text-lg group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
            {item.apellidos}, {capitalize(item.nombres)}
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground font-medium">
            {" "}
            <span className="tracking-wider bg-muted px-1.5 py-0.5 rounded border border-border">
              DNI: {item.dniString}
            </span>
          </div>
        </div>
      </td>

      {/* 3. ESTUDIO */}
      <td className="px-6 py-4 max-w-xs align-middle">
        <div className="flex flex-col items-center gap-2">
          {/* Modalidad */}
          <span
            className={`inline-block w-fit px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide ${getEstiloEstudio(
              item.tipoEstudio,
            ).badge}`}
          >
            {item.tipoEstudio}
          </span>

          {/* Estudio */}
          <div className="font-semibold text-center text-lg text-foreground leading-snug whitespace-pre-line">
            {solicitudLimpia}
          </div>

          {/* Diagnóstico */}
          {item.diagnostico && (
            <div className="text-xs text-muted-foreground italic truncate border-l-2 border-emerald-200 dark:border-emerald-800 pl-2">
              {item.diagnostico}
            </div>
          )}
        </div>
      </td>

      {/* 4. UBICACIÓN */}
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col items-center gap-1.5">
          {/* Badge Lugar */}
          <div
            className={`flex items-center px-3 py-1 rounded-lg border text-xs font-semibold uppercase ${estiloLugar.bg}`}
          >
            {estiloLugar.icon}
            {item.lugar}
          </div>

          {/* Sala Grande */}
          {item.sala ? (
            <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-black px-3 py-0.5 rounded-lg border-b-2 border-indigo-200 dark:border-indigo-800 text-lg shadow-sm min-w-[60px] text-center">
              {item.sala}
            </div>
          ) : (
            <span className="text-[10px] italic text-muted-foreground">Sin sala</span>
          )}

          {/* Alerta Urgente */}
          {esUrgente && (
            <div className="flex items-center gap-1 text-xs font-black text-red-600 dark:text-red-400 animate-pulse bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full border border-red-100 dark:border-red-900">
              URGENTE
            </div>
          )}
        </div>
      </td>

      {/* 6. ACCIONES */}
      <td className="px-6 py-4 text-right whitespace-nowrap align-middle">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <button
              onClick={() => onVerDetalle(item)}
                className="
    flex items-center justify-center gap-2 
    w-36 h-10 px-4
    rounded-lg border border-border 
    bg-muted text-muted-foreground font-semibold 
    text-xs uppercase tracking-wider
    transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 
    dark:hover:bg-blue-950/50 dark:hover:text-blue-300 dark:hover:border-blue-800
    active:scale-95 shadow-sm
  "
              title="Ver detalle completo"
            >
              <Eye className="w-4 h-4" strokeWidth={3} />
              <span>Ver Detalle</span>
            </button>

            {/* Dot de notificación: avisa que hay una nota */}
            {item.nota?.trim() && (
              <span
                title={`Nota: ${item.nota}`}
                onClick={() => onVerDetalle(item)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-white border-2 border-white flex items-center justify-center shadow-md shadow-amber-400 hover:bg-amber-500 transition-colors"
              >
                <AlertCircle className="w-2.5 h-2.5" strokeWidth={3} />
              </span>
            )}
          </div>

          {/* EL INTERRUPTOR (Switch) */}
          {onToggleEstado && (
            <div className="flex items-center justify-end gap-3">
              {/* 2. La Acción (Botón simple) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEstado(item);
                }}
                title={
                  isFinalizado
                    ? "Marcar como Pendiente"
                    : "Marcar como Finalizado"
                }
                className={`
    flex items-center justify-center gap-2 
    w-36 h-10 px-4 rounded-lg border 
    font-semibold text-xs tracking-wide shadow-sm
    transition-all active:scale-95
    ${estiloEstado.badge} ${estiloEstado.hover}
  `}
              >
                {/* Texto del estado */}
                <span className="leading-none">{estiloEstado.label}</span>

                {/* Icono dinámico */}
                {estiloEstado.icon}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
