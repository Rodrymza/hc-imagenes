import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Activity, CalendarClock, RefreshCw, X } from "lucide-react";
import { InternacionPedidoRow } from "@/components/pedidos/InternacionPedidoRow";
import { usePedidosInternacion } from "@/hooks/usePedidosInternacion";
import spinnerGif from "@/assets/spinner.gif";
import type { IPedidoInternacion } from "@/types/pedidos";
import { ModalDetalleInternacion } from "@/components/pedidos/ModalDetalleInternacion";
import CountPill from "@/components/CountPill";

export default function InternacionPage() {
  // 1. Iniciamos con un array vacío para esperar los datos reales de la API
  const {
    isLoading,
    refreshingInternacion,
    pedidosInternacion,
    traerPedidosInternacion,
    alternarEstadoPedido,
    lugares,
  } = usePedidosInternacion();

  // Estados de los filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroLugar, setFiltroLugar] = useState("todos");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const hoy = new Date().toISOString().split("T")[0];
  const [filtroFecha, setFiltroFecha] = useState(hoy);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<IPedidoInternacion | null>(null);

  const cargarPedidos = useCallback(async (fecha?: string) => {
    await traerPedidosInternacion(false, fecha);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerDetalle = (pedido: IPedidoInternacion) => {
    setPedidoSeleccionado(pedido); // Guardamos el objeto completo que ya tiene todo
    setModalOpen(true); // Abrimos el modal
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroLugar("todos");
    setFiltroModalidad("todos");
    setFiltroEstado("todos");
    setFiltroFecha(hoy); // Resetea a la fecha actual
  };

  // --- FILTRADO (Se ejecuta en cada renderizado) ---
  const pedidosFiltrados = pedidosInternacion.filter((p) => {
    const cumpleBusqueda =
      p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dniString.includes(busqueda) ||
      p.sala.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleLugar = filtroLugar === "todos" || p.lugar === filtroLugar;
    const cumpleModalidad =
      filtroModalidad === "todos" || p.tipoEstudio === filtroModalidad;

    const realizado =
      p.comentario?.toLowerCase().includes("realiz") ||
      p.comentario?.toLowerCase().includes("ok");
    const cumpleEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "realizado" ? realizado : !realizado);

    return cumpleBusqueda && cumpleLugar && cumpleModalidad && cumpleEstado;
  });

  const conteoPorTipo = useMemo(() => {
    const counts: Record<string, number> = {
      Tomografia: 0,
      Radiografia: 0,
      Ecografia: 0,
    };
    pedidosInternacion.forEach((p) => {
      if (p.tipoEstudio in counts) counts[p.tipoEstudio]++;
    });
    return counts;
  }, [pedidosInternacion]);

  useEffect(() => {
    cargarPedidos(filtroFecha);
    console.log(filtroFecha);
  }, [cargarPedidos, filtroFecha]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!document.hidden) traerPedidosInternacion(true);
    }, 30000);

    // LIMPIEZA: Muy importante limpiar el intervalo al desmontar
    return () => clearInterval(intervalo);
  }, [traerPedidosInternacion]);

  return (
    <>
      <div
        className="min-h-screen p-4 md:p-6 font-sans"
        style={{ background: "linear-gradient(135deg, #0e6d55, #6fd3b6)" }}
      >
        <div className="w-full 8xl mx-auto space-y-6">
          {/* HEADER: TODO EN UNA FILA */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-white p-1.5 rounded-lg text-emerald-700 shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase whitespace-nowrap">
                Internación
              </h1>
              <button
                onClick={() => traerPedidosInternacion(true, filtroFecha, true)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Recargar pedidos"
              >
                <RefreshCw
                  className={`w-6 h-6 ${refreshingInternacion ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/20" />

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <CountPill tipo="Total" valor={pedidosInternacion.length} />
              <CountPill tipo="Filtrados" valor={pedidosFiltrados.length} />
              <CountPill tipo="Radiografia" valor={conteoPorTipo.Radiografia} />
              <CountPill tipo="Tomografia" valor={conteoPorTipo.Tomografia} />
              <CountPill tipo="Ecografia" valor={conteoPorTipo.Ecografia} />
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/20" />

            <div className="relative flex-grow min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700" />
              <input
                type="text"
                className="block w-full pl-8 pr-3 py-3 bg-white border-none rounded-lg text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                placeholder="Buscar por Paciente, DNI o Sala..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="relative shrink-0">
              <CalendarClock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-700 z-10" />
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="pl-8 pr-2 py-3 bg-white border-none rounded-lg text-xs font-bold text-emerald-900"
              />
            </div>

            <select
              value={filtroLugar}
              onChange={(e) => setFiltroLugar(e.target.value)}
              className="px-3 py-3 bg-white border-none rounded-lg text-sm font-bold text-emerald-900 shrink-0"
            >
              <option value="todos">Lugar</option>
              {lugares.map((lugar) => (
                <option key={lugar} value={lugar}>
                  {lugar}
                </option>
              ))}
            </select>

            <select
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value)}
              className="px-3 py-3 bg-white border-none rounded-lg text-sm font-bold text-emerald-900 shrink-0"
            >
              <option value="todos">Modalidad</option>
              <option value="Radiografia">Radiografía</option>
              <option value="Tomografia">Tomografía</option>
              <option value="Ecografia">Ecografía</option>
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={`px-3 py-3 border-none rounded-lg text-sm font-black transition-all shrink-0 ${
                filtroEstado === "realizado"
                  ? "bg-emerald-600 text-white"
                  : filtroEstado === "pendiente"
                    ? "bg-red-600 text-white"
                    : "bg-white text-emerald-900"
              }`}
            >
              <option value="todos">Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="realizado">Realizados</option>
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
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-emerald-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-emerald-900 text-white uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold text-center">Fecha</th>
                  <th className="px-6 py-4 font-bold text-center">Paciente</th>
                  <th className="px-6 py-4 font-bold text-center">Estudio</th>
                  <th className="px-6 py-4 font-bold text-center">Ubicación</th>
                  <th className="px-6 py-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20">
                      <div className="flex flex-col items-center justify-center gap-4">
                        {/* Contenedor del GIF con tamaño controlado */}
                        <div className="w-40 h-40 flex items-center justify-center">
                          <img
                            src={spinnerGif}
                            alt="Cargando..."
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        {/* Texto con estilo coherente */}
                        <span className="text-emerald-900 font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                          Cargando pedidos...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((item) => (
                    <InternacionPedidoRow
                      key={item.idEstudio}
                      item={item}
                      onVerDetalle={handleVerDetalle}
                      onToggleEstado={alternarEstadoPedido}
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
                        No se encontraron pacientes para los filtros
                        seleccionados.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalDetalleInternacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pedido={pedidoSeleccionado}
      />
    </>
  );
}
