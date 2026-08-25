import type { IPedidoGuardia } from "@/types/pedidos";
import {
  Eye,
  Activity,
  MapPin,
  CalendarClock,
  Stethoscope, // Icono para Ubicación en Guardia
} from "lucide-react";
import { capitalize, getEstiloEstudio } from "./utils";

// Importamos la interfaz base (o la defines aquí mismo si prefiere

interface GuardiaPedidoRowProps {
  item: IPedidoGuardia;
  onVerDetalle: (item: IPedidoGuardia) => Promise<void>;
}

const getUbicacionEstilo = (ubicacion: string) => {
  const u = ubicacion?.toLowerCase() || "";
  if (u.includes("box") || u.includes("shock") || u.includes("rojo"))
    return {
      bg: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
      icon: <Activity className="w-3 h-3 mr-1" />,
    };
  if (u.includes("espera"))
    return {
      bg: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900",
      icon: <MapPin className="w-3 h-3 mr-1" />,
    };
  return {
    bg: "bg-muted text-muted-foreground border-border",
    icon: <Stethoscope className="w-3 h-3 mr-1" />,
  };
};

export const GuardiaPedidoRow = ({
  item,
  onVerDetalle,
}: GuardiaPedidoRowProps) => {
  // 1. Procesamiento de Fecha (Split seguro)
  // Asumiendo que fechaString viene algo como "2026-01-26 14:30" o similar
  const partesFecha = item.fechaString
    ? item.fechaString.split(" ")
    : ["--", "--"];
  const dia = partesFecha[0];
  const hora = partesFecha[1] || ""; // Por si viene solo la fecha

  const solicitudLimpia =
    item.solicitud?.slice(0, 1).toUpperCase() +
      item.solicitud?.split("<br>")[0].slice(1, item.solicitud.length) ||
    "Sin detalle";
  const estiloUbicacion = getUbicacionEstilo(item.ubicacion);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group border-b border-border last:border-0">
      {/* 1. FECHA */}
      <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
        <div className="flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-700 text-lg">{dia}</span>
            {hora && (
              <span className="text-base text-slate-400 font-mono">
                {hora} hs
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 2. PACIENTE */}
      <td className="px-6 py-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="font-black text-foreground text-lg group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
            {item.apellido}, {capitalize(item.nombre)}
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground font-medium">
            <span className="tracking-wider bg-muted px-1.5 py-0.5 rounded border border-border">
              DNI: {item.dni}
            </span>
          </div>
        </div>
      </td>

      {/* 3. ESTUDIO */}
      <td className="px-6 py-4 max-w-xs align-middle">
        <div className="flex flex-col items-center gap-2">
          <span
            className={`inline-block w-fit px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide ${getEstiloEstudio(
              item.tipoEstudio,
            ).badge}`}
          >
            {item.tipoEstudio}
          </span>

          <div className="font-semibold text-lg text-foreground leading-snug text-center">
            {solicitudLimpia}
          </div>
        </div>
      </td>

      {/* 4. UBICACIÓN (Guardia usa 'ubicacion' en vez de sala/cama) */}
      <td className="px-6 py-4 align-middle text-center hidden md:table-cell">
        <div className="flex flex-col items-center">
          <div
            /* Añadimos max-w y whitespace-normal */
            className={`flex items-center px-3 py-1 rounded-lg border text-xs font-semibold uppercase whitespace-normal max-w-[180px] leading-tight ${estiloUbicacion.bg}`}
          >
            {estiloUbicacion.icon}
            {item.ubicacion || "General"}
          </div>
        </div>
      </td>

      {/* 5. ACCIONES */}
      <td className="px-4 py-4 text-right whitespace-nowrap align-middle">
        <div className="flex flex-col items-center gap-2">
          {/* Botón Ver Detalle */}
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
    active:scale-95 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Pedidos</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
