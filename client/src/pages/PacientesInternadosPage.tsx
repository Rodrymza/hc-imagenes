import { useEffect, useState } from "react";
import { useConsumos } from "@/hooks/useConsumos";
import { TarjetaPacienteInternado } from "@/components/TarjetaPacienteInternado";
import { Search, Users, RefreshCw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-10 bg-slate-200 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-200 rounded-full w-20" />
        <div className="h-6 bg-slate-200 rounded-full w-16" />
      </div>
    </div>
  );
}

function PacientesInternadosPage() {
  const { getPacientesInternados, pacientesInternados, loadingInternados } =
    useConsumos(null);

  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getPacientesInternados();
  }, [getPacientesInternados]);

  const pacientesFiltrados = pacientesInternados?.filter(
    (p) =>
      p.nombre_apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.servicio.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sala.includes(busqueda.trim()),
  );

  const tienePacientes =
    Array.isArray(pacientesInternados) && pacientesInternados.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- ENCABEZADO Y BUSCADOR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                Gestión Hospitalaria
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Pacientes Internados
            </h1>
            <p className="text-slate-500 font-medium">
              Listado en tiempo real del sistema central
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Contadores
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className="bg-emerald-100 tracking-wide uppercase text-sm font-bold text-emerald-800 px-4 py-2 rounded-xl">
                {`Total internados: ${pacientesInternados?.length ?? 0}`}
              </span>
              <span className="bg-blue-100 tracking-wide uppercase text-sm font-bold text-blue-800 px-4 py-2 rounded-xl">
                {`Total Filtrados: ${pacientesFiltrados?.length ?? 0}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, servicio o sala..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-9 py-2.5 w-full md:w-[350px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
                aria-label="Buscar pacientes"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-md hover:bg-slate-200"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => getPacientesInternados()}
              className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Actualizar lista"
              aria-label="Actualizar lista de internados"
            >
              <RefreshCw
                className={`w-5 h-5 ${loadingInternados ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* --- ESTADO DE CARGA --- */}
        {loadingInternados ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {tienePacientes && pacientesFiltrados && pacientesFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pacientesFiltrados.map((paciente, index) => (
                  <div
                    key={paciente.historia_clinica}
                    style={{ animationDelay: `${index * 80}ms` }}
                    className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                  >
                    <TarjetaPacienteInternado
                      paciente={paciente}
                      onClick={(p) => {
                        navigate(`/consumos?hc=${p.historia_clinica}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {tienePacientes
                    ? "Sin resultados para tu búsqueda"
                    : "No hay pacientes internados"}
                </h3>
                <p className="text-slate-500 max-w-md">
                  {tienePacientes
                    ? "Intenta con otro nombre, servicio o sala."
                    : "Actualmente no hay pacientes internados registrados en el sistema."}
                </p>
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="mt-4 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PacientesInternadosPage;
