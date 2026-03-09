import { useEffect, useState } from "react";
import { useConsumos } from "@/hooks/useConsumos";
import { TarjetaPacienteInternado } from "@/components/TarjetaPacienteInternado"; // Ajusta la ruta
import { Search, Users, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      p.historia_clinica.includes(busqueda) ||
      p.servicio.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- ENCABEZADO Y BUSCADOR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
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

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, HC o servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full md:w-[350px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
              />
            </div>
            <button
              onClick={() => getPacientesInternados()}
              className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Actualizar lista"
            >
              <RefreshCw
                className={`w-5 h-5 ${loadingInternados ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* --- ESTADO DE CARGA --- */}
        {loadingInternados ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <Users className="w-6 h-6 text-emerald-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-slate-500 font-bold animate-pulse">
              Sincronizando con el servidor central...
            </p>
          </div>
        ) : (
          /* --- GRILLA DE PACIENTES --- */
          <>
            {pacientesFiltrados && pacientesFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pacientesFiltrados.map((paciente) => (
                  <TarjetaPacienteInternado
                    key={paciente.historia_clinica}
                    paciente={paciente}
                    onClick={(p) => {
                      navigate(`/consumos?hc=${p.historia_clinica}`);
                      // Aquí podrías navegar al detalle o abrir el modal de consumos
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  No se encontraron pacientes
                </h3>
                <p className="text-slate-500">
                  Intenta con otro nombre o criterio de búsqueda.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PacientesInternadosPage;
