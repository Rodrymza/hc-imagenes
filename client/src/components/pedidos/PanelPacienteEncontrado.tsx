import { UserCheck, Building2, CreditCard } from "lucide-react";
import type { IPacienteInterno } from "@/types/interno";

interface PanelPacienteEncontradoProps {
  paciente: IPacienteInterno;
  idCoberturaSeleccionada: string;
  onChangeCobertura: (id: string) => void;
}

export const PanelPacienteEncontrado = ({
  paciente,
  idCoberturaSeleccionada,
  onChangeCobertura,
}: PanelPacienteEncontradoProps) => {
  return (
    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-5">
        {/* LADO SUPERIOR: Datos del Paciente */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shrink-0 shadow-sm border border-emerald-200/50">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest mb-0.5">
              Paciente Vinculado
            </h4>
            <div className="flex flex-col">
              <span className="font-black text-emerald-950 text-base leading-tight">
                {paciente.apellidos}, {paciente.nombres}
              </span>
              <span className="text-xs font-bold text-emerald-700/70 mt-0.5">
                DNI: {paciente.idPaciente}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-emerald-100"></div>

        {/* LADO INFERIOR: Selector de Obra Social */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-emerald-700 uppercase flex items-center gap-1.5 tracking-widest">
            <CreditCard className="w-4 h-4" />
            Cobertura a Imputar
          </label>

          <div className="relative w-full">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
            <select
              value={idCoberturaSeleccionada}
              onChange={(e) => onChangeCobertura(e.target.value)}
              className="w-full pl-10 pr-10 py-3 text-sm bg-white border-2 border-emerald-100 text-emerald-900 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none shadow-sm cursor-pointer font-bold appearance-none transition-all hover:border-emerald-200"
            >
              {paciente.coberturas && paciente.coberturas.length > 0 ? (
                paciente.coberturas.map((cob) => (
                  <option key={cob.idCobertura} value={cob.idCobertura}>
                    {cob.sigla}
                  </option>
                ))
              ) : (
                <option value="09999">PACIENTE PARTICULAR</option>
              )}
            </select>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none bg-emerald-50 p-1 rounded-md">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
