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
    <div className="bg-emerald-50 border-t-4 border-emerald-500 p-1 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* LADO IZQUIERDO: Datos del Paciente */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-700 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-4">
            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-wide">
              Paciente Vinculado:
            </h4>
            <div className="flex items-center gap-4 text-xs text-emerald-800 font-medium">
              <span className="font-bold text-emerald-950 text-sm">
                {paciente.apellidos}, {paciente.nombres}
              </span>
              <span className="opacity-80">DNI: {paciente.idPaciente}</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Selector de Obra Social */}
        <div className="w-full sm:w-auto flex items-center gap-3">
          <label className="text-sm font-bold text-emerald-700 uppercase flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Cobertura:
          </label>

          <div className="relative">
            <Building2 className="absolute left-2.5 top-2 w-4 h-4 text-emerald-600 pointer-events-none" />
            <select
              value={idCoberturaSeleccionada}
              onChange={(e) => onChangeCobertura(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-8 py-1.5 text-sm bg-white border border-emerald-300 text-emerald-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm cursor-pointer font-medium appearance-none"
            >
              {/* Opción por defecto o mapeo de coberturas */}
              {paciente.coberturas && paciente.coberturas.length > 0 ? (
                paciente.coberturas.map((cob) => (
                  <option key={cob.idCobertura} value={cob.idCobertura}>
                    {cob.sigla}
                  </option>
                ))
              ) : (
                <option value="09999"> PACIENTES PARTICULAR</option>
              )}
            </select>

            {/* Flechita custom para el select */}
            <div className="absolute right-2 top-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
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
