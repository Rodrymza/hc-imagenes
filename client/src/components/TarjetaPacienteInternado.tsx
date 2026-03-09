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
        relative flex flex-col bg-white rounded-2xl border-2 border-slate-100 shadow-sm 
        overflow-hidden transition-all duration-200 
        ${onClick ? "cursor-pointer hover:border-indigo-300 hover:shadow-md hover:-translate-y-1 group" : ""}
      `}
    >
      {/* 1. HEADER: Servicio e Informe */}
      <div className="flex justify-between items-start p-4 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border border-indigo-100/50">
          <Activity className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">
            {paciente.servicio || "SIN SERVICIO"}
          </span>
        </div>

        {paciente.informe_id && (
          <div className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
            ID: {paciente.informe_id}
          </div>
        )}
      </div>

      {/* 2. BODY: Datos del Paciente */}
      <div className="flex flex-col p-5 flex-grow">
        <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">
          {paciente.nombre_apellido}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
            <FileDigit className="w-4 h-4 text-slate-400" />
            <span className="text-xs uppercase tracking-wider font-bold">
              HC:
            </span>
            <span className="font-black text-slate-700">
              {paciente.historia_clinica}
            </span>
          </div>
        </div>
      </div>

      {/* 3. FOOTER: Ubicación Física (Sala/Cama) */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100/50 group-hover:bg-emerald-100/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm">
              <Bed className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-emerald-600/70 uppercase tracking-widest">
                Ubicación
              </span>
              <span className="text-base font-bold text-emerald-900 leading-none mt-0.5">
                {paciente.sala || "A confirmar"}
              </span>
              <span className="text-sm font-bold text-emerald-900 leading-none mt-0.5">
                {paciente.servicio.split(" ").slice(1).join(" ") ||
                  "A confirmar"}
              </span>
            </div>
          </div>

          {/* Icono de acción si la tarjeta es clickeable */}
          {onClick && (
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 shadow-sm transition-all">
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
