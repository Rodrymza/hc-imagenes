import spinnerGif from "@/assets/spinner.gif";
import { GuardiaPedidoRow } from "@/components/pedidos/GuardiaPedidoRow"; // <--- CAMBIO IMPORTANTE
import { ModalDetalleGuardia } from "@/components/pedidos/ModalDetalleGuardia";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";
import type { IPedidoGuardia } from "@/types/pedidos";
import { CalendarClock, RefreshCw, Search, Siren, X } from "lucide-react"; // Agregué Siren para el ícono
import CountPill from "@/components/CountPill";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function PedidosGuardiaPage() {
  // 1. Destructuramos alternarEstadoPedido si ya lo creaste en el hook (como hicimos en Internación)
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
  // Estados de los filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroLugar, setFiltroLugar] = useState("todos");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<IPedidoGuardia | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Inicializamos con la fecha de hoy
  const hoy = new Date().toISOString().split("T")[0];
  const [filtroFecha, setFiltroFecha] = useState(hoy);

  const cargarPedidos = useCallback(
    async (fecha?: string) => {
      await traerPedidosGuardia(false, fecha);
    },
    [traerPedidosGuardia],
  );

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

  useEffect(() => {
    cargarPedidos(filtroFecha);
  }, [cargarPedidos, filtroFecha]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!document.hidden) traerPedidosGuardia(true);
    }, 30000);

    // LIMPIEZA: Muy importante limpiar el intervalo al desmontar
    return () => clearInterval(intervalo);
  }, [traerPedidosGuardia]);

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
