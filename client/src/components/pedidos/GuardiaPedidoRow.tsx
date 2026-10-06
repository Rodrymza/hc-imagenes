import type { GrupoPedidoGuardia, IPedidoGuardia } from "@/types/pedidos";
import {
  Eye,
  Activity,
  MapPin,
  CalendarClock,
  Stethoscope, // Icono para Ubicación en Guardia
} from "lucide-react";
import { capitalize, getEstiloEstudio } from "./utils";
import { TiempoDemora } from "./TiempoDemora";

interface GuardiaPedidoRowProps {
  grupo: GrupoPedidoGuardia;
  onVerDetalle: (grupo: GrupoPedidoGuardia) => void | Promise<void>;
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

const solicitudLimpia = (p: IPedidoGuardia) =>
  p.solicitud?.slice(0, 1).toUpperCase() +
    p.solicitud?.split("<br>")[0].slice(1, p.solicitud.length) || "Sin detalle";

export const GuardiaPedidoRow = ({
  grupo,
  onVerDetalle,
}: GuardiaPedidoRowProps) => {
  const representante = grupo.representante;
  const partesFecha = representante.fechaString
    ? representante.fechaString.split(" ")
    : ["--", "--"];
  const dia = partesFecha[0];
  const hora = partesFecha[1] || "";

  const estiloEstudio = getEstiloEstudio(grupo.modalidad);
  const estiloUbicacion = getUbicacionEstilo(representante.ubicacion);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group border-b border-border last:border-0">
      {/* 1. FECHA */}
      <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
        <div className="flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
<div className="flex flex-col w-full items-center">
              <span className="font-bold text-slate-700 text-lg">{dia}</span>
              {hora && (
                <span className="text-base text-slate-400 font-mono">
                  {hora} hs
                </span>
              )}
              {representante.fecha && (
                <div className="w-full mt-1">
                  <TiempoDemora
                    fechaCreacion={String(representante.fecha)}
                    solicitud={representante.solicitud}
                  />
                </div>
              )}
            </div>
        </div>
      </td>

      {/* 2. PACIENTE */}
      <td className="px-6 py-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="font-black text-foreground text-lg group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
            {representante.apellido}, {capitalize(representante.nombre)}
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground font-medium">
            <span className="tracking-wider bg-muted px-1.5 py-0.5 rounded border border-border">
              DNI: {representante.dni ?? "S/D"}
            </span>
          </div>
        </div>
      </td>

      {/* 3. ESTUDIO */}
      <td className="px-6 py-4 max-w-xs align-middle">
        <div className="flex flex-col items-center gap-2">
          <span
            className={`inline-block w-fit px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide ${estiloEstudio.badge}`}
          >
            {grupo.modalidad}
          </span>

          <div className="w-full grid gap-2 grid-cols-1">
            {grupo.items.map((estudio) => (
              <span
                key={String(estudio.idEstudio)}
                className="font-semibold text-center text-lg text-foreground leading-snug whitespace-pre-line"
              >
                {solicitudLimpia(estudio)}
              </span>
            ))}
          </div>
        </div>
      </td>

      {/* 4. UBICACIÓN (Guardia usa 'ubicacion' en vez de sala/cama) */}
      <td className="px-6 py-4 align-middle text-center hidden md:table-cell">
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center px-3 py-1 rounded-lg border text-xs font-semibold uppercase whitespace-normal max-w-[180px] leading-tight ${estiloUbicacion.bg}`}
          >
            {estiloUbicacion.icon}
            {representante.ubicacion || "General"}
          </div>
        </div>
      </td>

      {/* 5. ACCIONES */}
      <td className="px-4 py-4 text-right whitespace-nowrap align-middle">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onVerDetalle(grupo)}
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
