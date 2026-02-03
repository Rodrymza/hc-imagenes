import { useCallback, useEffect, useState } from "react";
import { Search, Activity, CalendarClock, RefreshCw } from "lucide-react";
import { InternacionPedidoRow } from "@/components/pedidos/InternacionPedidoRow";
import { usePedidosInternacion } from "@/hooks/usePedidosInternacion";
import spinnerGif from "@/assets/spinner.gif";
import type { IPedidoInternacion } from "@/types/pedidos";
import { ModalDetalleInternacion } from "@/components/pedidos/ModalDetalleInternacion";

export default function InternacionPage() {
  // 1. Iniciamos con un array vacío para esperar los datos reales de la API
  const {
    isLoading,
    pedidosInternacion,
    traerPedidosInternacion,
    alternarEstadoPedido,
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
  }, []);

  const handleVerDetalle = (pedido: IPedidoInternacion) => {
    setPedidoSeleccionado(pedido); // Guardamos el objeto completo que ya tiene todo
    setModalOpen(true); // Abrimos el modal
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
          {/* HEADER & TOOLBAR */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="bg-white p-2 rounded-lg text-emerald-700 shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Internación
              </h1>
              <button
                onClick={() => traerPedidosInternacion(true, filtroFecha)}
                className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all hidden sm:flex flex-row items-center justify-center gap-1"
                title="Recargar Pedidos página"
              >
                <RefreshCw className="h-5 w-5 text-green" />
                {"Recargar Pedidos"}
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 shadow-xl">
              <div className="flex flex-col xl:flex-row gap-4">
                <div className="relative flex-grow min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-700" />
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border-none rounded-lg text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Buscar por Paciente, DNI o Sala..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700 z-10" />
                    <input
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-none rounded-lg text-sm font-bold text-emerald-900"
                    />
                  </div>

                  <select
                    value={filtroLugar}
                    onChange={(e) => setFiltroLugar(e.target.value)}
                    className="px-4 py-2.5 bg-white border-none rounded-lg text-sm font-bold text-emerald-900"
                  >
                    <option value="todos">📍 Lugares</option>
                    <option value="En Cama">En Cama</option>
                    <option value="Tomografo">Tomógrafo</option>
                    <option value="Rayos">Rayos</option>
                  </select>

                  <select
                    value={filtroModalidad}
                    onChange={(e) => setFiltroModalidad(e.target.value)}
                    className="px-4 py-2.5 bg-white border-none rounded-lg text-sm font-bold text-emerald-900"
                  >
                    <option value="todos">📋 Modalidades</option>
                    <option value="Radiografia">Radiografía</option>
                    <option value="Tomografia">Tomografía</option>
                    <option value="Ecografia">Ecografía</option>
                  </select>

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className={`px-4 py-2.5 border-none rounded-lg text-sm font-black transition-all ${
                      filtroEstado === "realizado"
                        ? "bg-emerald-600 text-white"
                        : filtroEstado === "pendiente"
                          ? "bg-red-600 text-white"
                          : "bg-white text-emerald-900"
                    }`}
                  >
                    <option value="todos">🔄 Estados</option>
                    <option value="pendiente">❌ Pendientes</option>
                    <option value="realizado">✅ Realizados</option>
                  </select>
                </div>
              </div>
            </div>
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
              <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-100">
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
