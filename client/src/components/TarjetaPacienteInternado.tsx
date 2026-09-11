import type { IPacienteInternado } from "@/types/interno";
import { FileDigit, Activity, Bed, ChevronRight } from "lucide-react";

interface TarjetaPacienteInternadoProps {
  paciente: IPacienteInternado;
  onClick?: (paciente: IPacienteInternado) => void;
}

export const TarjetaPacienteInternado = ({
  paciente,
  onClick,
}: TarjetaPacienteInternadoProps) => {
  return (
    <div
      onClick={() => onClick && onClick(paciente)}
      className={`
        relative flex flex-col bg-card rounded-2xl border-2 border-border shadow-sm
        overflow-hidden transition-all duration-200
        ${onClick ? "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-1 group" : ""}
      `}
    >
      {/* 1. HEADER: Servicio e Informe */}
      <div className="flex justify-between items-start p-4 border-b border-muted bg-muted/50">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-black uppercase tracking-tight shadow-sm border border-indigo-100/50 dark:border-indigo-900">
          <Activity className="w-3.5 h-3.5" />
          <span className="truncate w-fit">
            {paciente.servicio.split(" ").slice(1).join(" ") || "SIN SERVICIO"}
          </span>
        </div>
      </div>

      {/* 2. BODY: Datos del Paciente */}
      <div className="flex flex-col p-5 flex-grow">
        <h3 className="text-xl font-black text-foreground leading-tight mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
          {paciente.nombre_apellido}
        </h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mt-1">
          <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
            <FileDigit className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider font-bold">
              HC:
            </span>
            <span className="font-black text-foreground">
              {paciente.historia_clinica}
            </span>
          </div>
        </div>
      </div>

      {/* 3. FOOTER: Ubicación Física (Sala/Cama) */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100/50 dark:border-emerald-900 group-hover:bg-emerald-100/50 dark:group-hover:bg-emerald-950/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-card rounded-lg text-emerald-600 shadow-sm">
              <Bed className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-emerald-600/70 uppercase tracking-widest">
                Ubicación
              </span>
              <span className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-none mt-0.5">
                {paciente.sala || "A confirmar"}
              </span>
              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200 leading-none mt-0.5">
                {paciente.servicio.split(" ").slice(1).join(" ") ||
                  "A confirmar"}
              </span>
            </div>
          </div>

          {/* Icono de acción si la tarjeta es clickeable */}
          {onClick && (
            <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted-foreground group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 shadow-sm transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Efecto visual de borde izquierdo de color */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/80"></div>
    </div>
  );
};
