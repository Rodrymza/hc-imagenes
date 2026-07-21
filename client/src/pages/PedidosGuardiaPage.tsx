import spinnerGif from "@/assets/spinner.gif";
import { GuardiaPedidoRow } from "@/components/pedidos/GuardiaPedidoRow";
import { ModalDetalleGuardia } from "@/components/pedidos/ModalDetalleGuardia";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";
import type { IPedidoGuardia } from "@/types/pedidos";
import {
  CalendarClock,
  RefreshCw,
  Search,
  Siren,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import CountPill from "@/components/CountPill";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GuardiaService } from "@/services/guardia.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useAuth } from "@/context/AuthContext";

export default function PedidosGuardiaPage() {
  const {
    loadingGuardia,
    refreshingGuardia,
    pedidosGuardia,
    pedidosPaciente,
    lugaresGuardia,
    traerPedidosGuardia,
    buscarPedidosPaciente,
    transferirPedido,
    pacienteGuardia,
    buscarPacienteGuardia,
    loadingPedidosPaciente,
  } = useServicioGuardia();

  const [hsiSessionActive, setHsiSessionActive] = useState<boolean | null>(
    null,
  );
  const [hsiChecking, setHsiChecking] = useState(true);
  const [totpInput, setTotpInput] = useState("");
  const [hsiLoggingIn, setHsiLoggingIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await GuardiaService.checkHsiSession();
        if (!cancelled) {
          setHsiSessionActive(res.hasSession);
          setHsiChecking(false);
        }
      } catch {
        if (!cancelled) {
          setHsiSessionActive(false);
          setHsiChecking(false);
        }
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleHsiLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.length !== 6) return;

    setHsiLoggingIn(true);
    try {
      await GuardiaService.loginGuardia(totpInput);
      setHsiSessionActive(true);
      setTotpInput("");
      toast.success("Sesión HSI activa");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Error al iniciar sesión en HSI");
    } finally {
      setHsiLoggingIn(false);
    }
  };

  const [busqueda, setBusqueda] = useState("");
  const [filtroLugar, setFiltroLugar] = useState("todos");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<IPedidoGuardia | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { activeOperator } = useAuth();

  const hoy = new Date().toISOString().split("T")[0];
  const [filtroFecha, setFiltroFecha] = useState(hoy);

  const cargarPedidos = useCallback(
    async (fecha?: string) => {
      await traerPedidosGuardia(false, fecha);
    },
    [traerPedidosGuardia],
  );

  useEffect(() => {
    if (hsiSessionActive) {
      cargarPedidos(filtroFecha);
    }
  }, [hsiSessionActive, cargarPedidos, filtroFecha]);

  useEffect(() => {
    if (!hsiSessionActive) return;
    const intervalo = setInterval(() => {
      if (!document.hidden) traerPedidosGuardia(true);
    }, 30000);
    return () => clearInterval(intervalo);
  }, [hsiSessionActive, traerPedidosGuardia]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroLugar("todos");
    setFiltroModalidad("todos");
    setFiltroFecha(hoy); // Resetea a la fecha actual
  };

  const handleVerDetalle = async (item: IPedidoGuardia) => {
    setPedidoSeleccionado(item);
    setModalOpen(true);

    await buscarPacienteGuardia(item.dni.toString());
    await buscarPedidosPaciente(item.dni.toString());
  };

  const handleFinalizarPedido = async (idEstudio: string) => {
    await transferirPedido(idEstudio);
  };

  const pedidosFiltrados = pedidosGuardia.filter((p: IPedidoGuardia) => {
    // 1. Busqueda: Usamos apellido (singular) y nombre
    const textoBusqueda = busqueda.toLowerCase();
    const cumpleBusqueda =
      p.apellido.toLowerCase().includes(textoBusqueda) ||
      p.nombre.toLowerCase().includes(textoBusqueda) ||
      p.dni.toString().includes(busqueda); // dni es number, pasamos a string

    // 2. Modalidad
    const cumpleModalidad =
      filtroModalidad === "todos" || p.tipoEstudio === filtroModalidad;

    // 3. Lugar: Usamos p.ubicacion
    const cumpleLugar =
      filtroLugar === "todos" ||
      p.ubicacion?.toLowerCase().includes(filtroLugar.toLowerCase());

    return cumpleBusqueda && cumpleModalidad && cumpleLugar;
  });

  const conteoPorTipo = useMemo(() => {
    const counts: Record<string, number> = {
      Tomografia: 0,
      Radiografia: 0,
      Ecografia: 0,
    };
    pedidosGuardia.forEach((p) => {
      if (p.tipoEstudio in counts) counts[p.tipoEstudio]++;
    });
    return counts;
  }, [pedidosGuardia]);

  if (hsiChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-sans"
        style={{ background: "linear-gradient(135deg, #7c1919, #d44545)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-white font-bold">
            Verificando sesión HSI...
          </span>
        </div>
      </div>
    );
  }

  if (!hsiSessionActive) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 font-sans"
        style={{ background: "linear-gradient(135deg, #7c1919, #d44545)" }}
      >
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="pt-8 pb-6 px-8 flex flex-col items-center">
            <div className="bg-red-50 p-3 rounded-full mb-4 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Sesión HSI Requerida
            </h1>
            <p className="text-sm text-slate-500 mt-1 text-center">
              Ingresá el código de tu Authenticator para acceder a Guardia
            </p>
            <p className="text-sm text-slate-600 mt-1 text-center">
              Usuario: <strong>{activeOperator?.username}</strong>
            </p>
          </div>

          <form onSubmit={handleHsiLogin} className="px-8 pb-8 space-y-5">
            <div className="space-y-1">
              <label
                htmlFor="totpGuardia"
                className="block text-sm font-bold text-slate-700"
              >
                Código Authenticator HSI
              </label>
              <input
                id="totpGuardia"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                required
                placeholder="123456"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all tracking-[0.5em] text-center font-mono text-lg"
                value={totpInput}
                onChange={(e) =>
                  setTotpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={hsiLoggingIn}
              />
              <p className="text-xs text-slate-400">
                Código de 6 dígitos de la app Authenticator
              </p>
            </div>

            <button
              type="submit"
              disabled={hsiLoggingIn || totpInput.length !== 6}
              className="w-full flex items-center justify-center py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {hsiLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                "Iniciar Sesión en HSI"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen p-4 md:p-6 font-sans"
        // Cambié levemente el gradiente a rojizo para diferenciar visualmente "Guardia" de "Internación"
        style={{ background: "linear-gradient(135deg, #7c1919, #d44545)" }}
      >
        <div className="w-full 8xl mx-auto space-y-6">
          {/* HEADER: TODO EN UNA FILA */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-white p-1.5 rounded-lg text-red-700 shadow-sm">
                <Siren className="w-4 h-4 animate-pulse" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase whitespace-nowrap">
                Guardia
              </h1>
              <button
                onClick={() => traerPedidosGuardia(true, undefined, true)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Recargar pedidos"
              >
                <RefreshCw
                  className={`w-6 h-6 ${refreshingGuardia ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/20" />

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <CountPill tipo="Total" valor={pedidosGuardia.length} />
              <CountPill tipo="Filtrados" valor={pedidosFiltrados.length} />
              <CountPill tipo="Radiografia" valor={conteoPorTipo.Radiografia} />
              <CountPill tipo="Tomografia" valor={conteoPorTipo.Tomografia} />
              <CountPill tipo="Ecografia" valor={conteoPorTipo.Ecografia} />
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/20" />

            <div className="relative flex-grow min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-700" />
              <input
                type="text"
                className="block w-full pl-8 pr-3 py-3 bg-white border-none rounded-lg text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 font-medium text-sm"
                placeholder="Buscar por Paciente o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="relative shrink-0">
              <CalendarClock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-red-700 z-10" />
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="pl-8 pr-2 py-3 bg-white border-none rounded-lg text-xs font-bold text-red-900"
              />
            </div>

            <select
              value={filtroLugar}
              onChange={(e) => setFiltroLugar(e.target.value)}
              className="px-3 py-3 bg-white border-none rounded-lg text-sm font-bold text-red-900 shrink-0"
            >
              <option value="todos">Ubicación</option>
              {lugaresGuardia.map((lugar) => (
                <option key={lugar} value={lugar}>
                  {lugar}
                </option>
              ))}
            </select>

            <select
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value)}
              className="px-3 py-3 bg-white border-none rounded-lg text-sm font-bold text-red-900 shrink-0"
            >
              <option value="todos">Modalidad</option>
              <option value="Radiografia">Radiografía</option>
              <option value="Tomografia">Tomografía</option>
              <option value="Ecografia">Ecografía</option>
            </select>

            <button
              onClick={limpiarFiltros}
              className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
              title="Limpiar filtros"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* TABLA */}
          <div className="bg-white rounded-xl shadow-2xl overflow-x-auto border border-red-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-red-900 text-white uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold text-center">Fecha</th>
                  <th className="px-6 py-4 font-bold text-center">Paciente</th>
                  <th className="px-6 py-4 font-bold text-center">Estudio</th>
                  <th className="px-6 py-4 font-bold text-center hidden md:table-cell">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-50">
                {loadingGuardia ? (
                  <tr>
                    <td colSpan={5} className="py-20">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-40 h-40 flex items-center justify-center">
                          <img
                            src={spinnerGif}
                            alt="Cargando..."
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <span className="text-red-900 font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                          Cargando urgencias...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((item: IPedidoGuardia) => (
                    <GuardiaPedidoRow
                      key={item.idEstudio}
                      item={item}
                      onVerDetalle={handleVerDetalle}
                      // IMPORTANTE: Si tu hook de guardia aun no tiene esta función,
                      // coméntala temporalmente para evitar errores.
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-20 text-center text-slate-400"
                    >
                      <Search className="w-12 h-12 mx-auto opacity-20 mb-2" />
                      <p className="font-medium">
                        No hay pacientes en espera con esos criterios.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modalOpen && (
        <ModalDetalleGuardia
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          paciente={pacienteGuardia!}
          pedidoGeneral={pedidoSeleccionado!}
          pedidos={pedidosPaciente}
          loadingPedidosPaciente={loadingPedidosPaciente}
          onFinalizarEstudio={handleFinalizarPedido}
        />
      )}
    </>
  );
}
