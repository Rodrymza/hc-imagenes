import type { IPedidoInternacion } from "@/types/pedidos";
import {
  Eye,
  BedDouble,
  Activity,
  MapPin,
  AlertTriangle,
  CalendarClock,
  Check,
  X,
} from "lucide-react";
import { capitalize, getLugarEstilo } from "./utils";

interface PedidoRowProps {
  item: IPedidoInternacion;
  onVerDetalle: (item: IPedidoInternacion) => void;
  onToggleEstado?: (item: IPedidoInternacion) => void; // Opcional (para Guardia)
}

// --- AYUDANTES DE ESTILO (Locales al componente) ---
const getBadgeColor = (tipo: string) => {
  const t = tipo.toLowerCase();
  if (t.includes("tomo")) return "bg-blue-600 text-white";
  if (t.includes("radio") || t.includes("rx")) return "bg-red-600 text-white";
  if (t.includes("eco")) return "bg-purple-600 text-white";
  return "bg-slate-600 text-white";
};

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

  return (
    <tr className="hover:bg-emerald-50/60 transition-colors group border-b-8 border-slate-100 last:border-0">
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
          <span className="font-black text-slate-800 text-lg group-hover:text-emerald-800 transition-colors">
            {" "}
            {item.apellidos}, {capitalize(item.nombres)}
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
            {" "}
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              DNI: {item.dniString}
            </span>
            <span className="text-slate-300">|</span>
            <span>{item.fechaNacimiento}</span>
          </div>
        </div>
      </td>

      {/* 3. ESTUDIO */}
      <td className="px-6 py-4 max-w-xs align-middle">
        <div className="flex flex-col items-center gap-2">
          {/* Modalidad */}
          <span
            className={`inline-block w-fit px-3 py-1.5 rounded-md text-xs font-black uppercase shadow-sm tracking-wide ${getBadgeColor(
              item.tipoEstudio,
            )}`}
          >
            {item.tipoEstudio}
          </span>

          {/* Estudio */}
          <div className="font-bold text-center text-lg text-slate-800 leading-snug whitespace-pre-line">
            {solicitudLimpia}
          </div>

          {/* Diagnóstico */}
          {item.diagnostico && (
            <div className="text-xs text-slate-500 italic truncate border-l-2 border-emerald-200 pl-2">
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
            className={`flex items-center px-3 py-1 rounded border text-base font-bold uppercase ${estiloLugar.bg}`}
          >
            {estiloLugar.icon}
            {item.lugar}
          </div>

          {/* Sala Grande */}
          {item.sala ? (
            <div className="bg-indigo text-indigo-800 font-black px-3 py-0.5 rounded border-b-2 border-indigo-200 text-lg shadow-sm min-w-[60px] text-center">
              {item.sala}
            </div>
          ) : (
            <span className="text-[10px] italic text-slate-400">Sin sala</span>
          )}

          {/* Alerta Urgente */}
          {esUrgente && (
            <div className="flex items-center gap-1 text-xs font-black text-red-600 animate-pulse bg-red-50 px-3 py-1 rounded-full border border-red-100">
              URGENTE
            </div>
          )}
        </div>
      </td>

      {/* 6. ACCIONES */}
      <td className="px-6 py-4 text-right whitespace-nowrap align-middle">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onVerDetalle(item)}
            className="
    flex items-center justify-center gap-2 
    w-36 h-10 px-4
    rounded-lg border-2 border-slate-200 
    bg-slate-50 text-slate-600 font-black 
    text-xs uppercase tracking-wider
    transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 
    active:scale-95 shadow-sm
  "
            title="Ver detalle completo"
          >
            <Eye className="w-4 h-4" strokeWidth={3} />
            <span>Ver Detalle</span>
          </button>

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
                    ? "Marcar como finalizado"
                    : "Marcar como pendiente"
                }
                className={`
    flex items-center justify-center gap-2 
    w-36 h-10 px-4 rounded-lg border-2 
    text-xs font-black uppercase tracking-widest 
    transition-all active:scale-95 shadow-sm
    ${
      isFinalizado
        ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-emerald-100"
        : "bg-red-600 text-white border-red-700 hover:bg-red-700 shadow-red-100"
    }
  `}
              >
                {/* Texto del estado */}
                <span className="leading-none">
                  {isFinalizado ? "Realizado" : "Pendiente"}
                </span>

                {/* Iconos Dinámicos */}
                {isFinalizado ? (
                  <Check className="w-4 h-4" strokeWidth={4} />
                ) : (
                  <X className="w-4 h-4" strokeWidth={4} />
                )}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
