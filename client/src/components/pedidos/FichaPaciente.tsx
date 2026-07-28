import { ShieldCheck } from "lucide-react";
import type { ICobertura } from "@/types/interno";

export interface PacienteData {
  apellido: string;
  nombres: string;
  historiaClinica: string;
  dniString: string;
  fechaNacimientoString: string;
}

interface FichaPacienteProps {
  paciente: PacienteData;
  sistema: string | null;
  onSistemaChange: (sistema: string | null) => void;
  coberturaId: string;
  onCoberturaChange: (id: string) => void;
  coberturas?: ICobertura[];
}

export function FichaPaciente({
  paciente,
  sistema,
  onSistemaChange,
  coberturaId,
  onCoberturaChange,
  coberturas,
}: FichaPacienteProps) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="bg-emerald-500 p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">
              Paciente Identificado
            </p>
            <h2 className="text-xl font-black uppercase leading-tight">
              {paciente.apellido}, {paciente.nombres}
            </h2>
          </div>
          <ShieldCheck className="w-8 h-8 opacity-40" />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-400 uppercase">
              Historia Clinica
            </span>
            <span className="font-bold text-slate-700">
              {paciente.historiaClinica}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-400 uppercase">
              Documento
            </span>
            <span className="font-bold text-slate-700 tracking-widest">
              {paciente.dniString}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-400 uppercase">
              Fecha Nacimiento
            </span>
            <span className="font-bold text-slate-700">
              {paciente.fechaNacimientoString}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Sistema de Ingreso
            </label>
            <select
              value={sistema || ""}
              onChange={(e) => onSistemaChange(e.target.value || null)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">⚠️ Seleccione una opcion</option>
              <option value="ambulatorio">📅 AMBULATORIO</option>
              <option value="guardia">🚨 GUARDIA</option>
              <option value="internacion">🏥 INTERNACIÓN</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Obra Social
            </label>
            <select
              value={coberturaId}
              onChange={(e) => onCoberturaChange(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {coberturas?.map((cob) => (
                <option key={cob.idCobertura} value={cob.idCobertura}>
                  {cob.sigla}
                </option>
              )) || null}
              <option value="09999">PACIENTES PARTICULAR</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
