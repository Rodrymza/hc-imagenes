import { useState } from "react";
import {
  Search,
  User,
  ShieldCheck,
  ExternalLink,
  Fingerprint,
  Calendar,
  Mars,
  Venus,
} from "lucide-react";
import { useConsumos } from "@/hooks/useConsumos";
import { Link } from "react-router-dom"; // O tu router

export default function BuscarPaciente() {
  const [dni, setDni] = useState("");
  const { pacienteInterno, buscarPacienteInterno, loadingPaciente } =
    useConsumos(null);

  const handleBuscar = () => {
    if (dni.trim()) {
      buscarPacienteInterno(dni);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-8 transition-colors duration-500">
      {" "}
      {/* 1. BARRA DE BÚSQUEDA SUPERIOR */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase mb-6">
          Consulta Maestro de Pacientes
        </h1>
        <div className="relative max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Ingrese DNI del paciente..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
          </div>

          {/* BOTÓN DE BÚSQUEDA AGREGADO */}
          <button
            onClick={handleBuscar}
            disabled={loadingPaciente || !dni}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center gap-2"
          >
            {loadingPaciente ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>
      </div>
      {pacienteInterno ? (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-6">
            {/* COLUMNA 1: FICHA PERSONAL */}
            <div className="bg-indigo-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden pb-3">
              <div className="p-1 bg-indigo-600"></div>
              <div className="p-6 text-center border-b border-slate-100">
                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-300">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase leading-tight">
                  {pacienteInterno.apellidos}, {pacienteInterno.nombres}
                </h2>
                <span className="text-sm font-bold tracking-tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-2 inline-block">
                  HC: {pacienteInterno.idPaciente}
                </span>
              </div>
              <div className="p-6 space-y-4 tracking-widest">
                <InfoRow
                  label="DNI / Documento"
                  value={parseInt(pacienteInterno.dni).toLocaleString("ES-AR")}
                  icon={<Fingerprint className="w-4 h-4" />}
                />
                <InfoRow
                  label="Fecha Nacimiento"
                  value={pacienteInterno.fechaNacimientoString}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoRow
                  label="Sexo"
                  value={pacienteInterno.sexo}
                  icon={pacienteInterno.sexo == "M" ? <Mars /> : <Venus />}
                />
              </div>

              <div className="lg:col-span-2 space-y-6 flex flex-col items-center">
                <Link
                  to={`/consumos?dni=${pacienteInterno.dni}`}
                  className="flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <ExternalLink className="w-5 h-5" /> CARGAR NUEVO CONSUMO
                </Link>
              </div>
            </div>

            {/* COLUMNA 2: COBERTURAS Y ACCIONES */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bloque Coberturas */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />{" "}
                  Coberturas Registradas
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {pacienteInterno.coberturas.map((cob) => (
                    <div
                      key={cob.idCobertura}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                    >
                      <p className="text-base font-bold text-slate-800">
                        {cob.sigla || "Sin Sigla"}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {cob.nombre || "Sin Descripcion"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loadingPaciente && (
          <div className="max-w-md mx-auto text-center mt-20 opacity-30">
            <User className="w-24 h-24 mx-auto mb-4" />
            <p className="text-xl font-medium">
              Ingrese un DNI para comenzar la consulta
            </p>
          </div>
        )
      )}
    </div>
  );
}

// Componente Helper para las filas de info
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-around border-b border-slate-50 pb-2 last:border-0">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm font-bold uppercase tracking-tight">
          {label}
        </span>
      </div>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}
