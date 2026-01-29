import type { IPedidoGuardia } from "@/types/pedidos";
import {
  Eye,
  Activity,
  MapPin,
  CalendarClock,
  Stethoscope, // Icono para Ubicación en Guardia
} from "lucide-react";
import { capitalize } from "./utils";

// Importamos la interfaz base (o la defines aquí mismo si prefiere

interface GuardiaPedidoRowProps {
  item: IPedidoGuardia;
  onVerDetalle: (item: IPedidoGuardia) => Promise<void>;
}

// --- AYUDANTES DE ESTILO ---
const getBadgeColor = (tipo: string) => {
  const t = tipo?.toLowerCase() || "";
  if (t.includes("tomo")) return "bg-blue-600 text-white";
  if (t.includes("radio") || t.includes("rx")) return "bg-red-600 text-white";
  if (t.includes("eco")) return "bg-purple-600 text-white";
  return "bg-slate-600 text-white";
};

const getUbicacionEstilo = (ubicacion: string) => {
  const u = ubicacion?.toLowerCase() || "";
  if (u.includes("box") || u.includes("shock") || u.includes("rojo"))
    return {
      bg: "bg-red-50 text-red-900 border-red-200",
      icon: <Activity className="w-3 h-3 mr-1" />,
    };
  if (u.includes("espera"))
    return {
      bg: "bg-green-50 text-green-800 border-green-200",
      icon: <MapPin className="w-3 h-3 mr-1" />,
    };
  return {
    bg: "bg-slate-100 text-slate-700 border-slate-300",
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
    <tr className="hover:bg-slate-50 transition-colors group border-b border-slate-200 last:border-0">
      {/* 1. FECHA */}
      <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
        <div className="flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4 text-slate-400" />
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
          <span className="font-black text-slate-800 text-lg group-hover:text-blue-800 transition-colors">
            {item.apellido}, {capitalize(item.nombre)}
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              DNI: {item.dni}
            </span>
            <span className="text-slate-300">|</span>
            {/* Usamos fechaNacimientoString o calculamos algo con 'edad' si prefieres */}
            <span>{item.edad} Años</span>
          </div>
        </div>
      </td>

      {/* 3. ESTUDIO */}
      <td className="px-6 py-4 max-w-xs align-middle">
        <div className="flex flex-col items-center gap-2">
          <span
            className={`inline-block w-fit px-3 py-1.5 rounded text-xs font-black uppercase shadow-sm tracking-wide ${getBadgeColor(
              item.tipoEstudio,
            )}`}
          >
            {item.tipoEstudio}
          </span>

          <div className="font-bold text-lg text-slate-800 leading-snug text-center">
            {solicitudLimpia}
          </div>
        </div>
      </td>

      {/* 4. UBICACIÓN (Guardia usa 'ubicacion' en vez de sala/cama) */}
      <td className="px-6 py-4 align-middle text-center">
        <div className="flex flex-col items-center">
          <div
            /* Añadimos max-w y whitespace-normal */
            className={`flex items-center px-3 py-1 rounded border text-base font-bold uppercase whitespace-normal max-w-[180px] leading-tight ${estiloUbicacion.bg}`}
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
    rounded-lg border-2 border-slate-200 
    bg-slate-50 text-slate-600 font-black 
    text-xs uppercase tracking-wider
    transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 
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
