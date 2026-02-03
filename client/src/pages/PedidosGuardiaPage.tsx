import spinnerGif from "@/assets/spinner.gif";
import { GuardiaPedidoRow } from "@/components/pedidos/GuardiaPedidoRow"; // <--- CAMBIO IMPORTANTE
import { ModalDetalleGuardia } from "@/components/pedidos/ModalDetalleGuardia";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";
import type { IPedidoGuardia } from "@/types/pedidos";
import { CalendarClock, RefreshCw, Search, Siren } from "lucide-react"; // Agregué Siren para el ícono
import { useCallback, useEffect, useState } from "react";

export default function PedidosGuardiaPage() {
  // 1. Destructuramos alternarEstadoPedido si ya lo creaste en el hook (como hicimos en Internación)
  const {
    loadingGuardia,
    pedidosGuardia,
    pedidosPaciente,
    traerPedidosGuardia,
    buscarPedidosPaciente,
    finalizarEstudio,
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

  const handleVerDetalle = async (item: IPedidoGuardia) => {
    setPedidoSeleccionado(item);
    setModalOpen(true);

    await buscarPacienteGuardia(item.dni.toString());
    await buscarPedidosPaciente(item.dni.toString());
  };

  const handleFinalizarPedido = async (
    idEstudio: string,
    dniPaciente: string,
  ) => {
    await finalizarEstudio(idEstudio, dniPaciente);
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
          {/* HEADER & TOOLBAR */}
          <div className="flex flex-col flex-between gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="bg-white p-2 rounded-lg text-red-700 shadow-sm">
                <Siren className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Guardia / Emergencias
              </h1>
              <button
                onClick={() => traerPedidosGuardia(true)}
                className="p-2 text-slate-300 hover:text-red-600 hover:bg-emerald-50 rounded-full transition-all hidden sm:flex flex-row items-center justify-center gap-1"
                title="Recargar Pedidos página"
              >
                <RefreshCw className="h-5 w-5 text-green" />{" "}
                {"Recargar Pedidos"}
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 shadow-xl">
              <div className="flex flex-col xl:flex-row gap-4">
                {/* BUSCADOR */}
                <div className="relative flex-grow min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-700" />
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border-none rounded-lg text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 font-medium"
                    placeholder="Buscar por Paciente o DNI..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                {/* FILTROS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-700 z-10" />
                    <input
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-none rounded-lg text-sm font-bold text-red-900"
                    />
                  </div>

                  {/* SELECT DE LUGARES (ADAPTADO A GUARDIA) */}
                  <select
                    value={filtroLugar}
                    onChange={(e) => setFiltroLugar(e.target.value)}
                    className="px-4 py-2.5 bg-white border-none rounded-lg text-sm font-bold text-red-900"
                  >
                    <option value="todos">📍 Ubicación</option>
                    <option value="Box">Box / Shock Room</option>
                    <option value="Espera">Sala de Espera</option>
                    <option value="Triage">Triage</option>
                  </select>

                  <select
                    value={filtroModalidad}
                    onChange={(e) => setFiltroModalidad(e.target.value)}
                    className="px-4 py-2.5 bg-white border-none rounded-lg text-sm font-bold text-red-900"
                  >
                    <option value="todos">📋 Modalidades</option>
                    <option value="Radiografia">Radiografía</option>
                    <option value="Tomografia">Tomografía</option>
                    <option value="Ecografia">Ecografía</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-red-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-red-900 text-white uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold text-center">Fecha</th>
                  <th className="px-6 py-4 font-bold text-center">Paciente</th>
                  <th className="px-6 py-4 font-bold text-center">Estudio</th>
                  <th className="px-6 py-4 font-bold text-center">Ubicación</th>
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
