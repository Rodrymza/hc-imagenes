import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Activity,
  CalendarClock,
  RefreshCw,
  X,
  Eye,
  EyeClosed,
  Hospital,
  Bed,
} from "lucide-react";
import { InternacionPedidoRow } from "@/components/pedidos/InternacionPedidoRow";
import { PedidoCard } from "@/components/pedidos/PedidoCard";
import PaginationBar from "@/components/PaginationBar";
import { usePedidosInternacion } from "@/hooks/usePedidosInternacion";
import spinnerGif from "@/assets/spinner.gif";
import type { IPedidoInternacion } from "@/types/pedidos";
import type { PedidoCardData } from "@/types/pedidoCard";
import { ModalDetalleInternacion } from "@/components/pedidos/ModalDetalleInternacion";
import { PedidosFooter } from "@/components/layouts/PedidosFooter";
import { capitalize } from "@/components/pedidos/utils";

export default function InternacionPage() {
  // 1. Iniciamos con un array vacío para esperar los datos reales de la API
  const {
    isLoading,
    refreshingInternacion,
    pedidosInternacion,
    traerPedidosInternacion,
    alternarEstadoPedido,
    guardarNota,
    lugares,
  } = usePedidosInternacion();

  // Estados de los filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroLugar, setFiltroLugar] = useState("todos");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPiso, setFiltroPiso] = useState("todos");
  const hoy = new Date().toISOString().split("T")[0];
  const [filtroFecha, setFiltroFecha] = useState(hoy);
  const [showFiltros, setShowFiltros] = useState(
    () => localStorage.getItem("filtrosInternacion") !== "false",
  );

  const [enCama, setEnCama] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<IPedidoInternacion | null>(null);

  const ITEMS_POR_PAGINA = 10;
  const [paginaActual, setPaginaActual] = useState(1);

  const GRUPOS_SALA = [
    {
      value: "primer_piso",
      label: "1° Piso",
      matcher: (n: number) => n >= 100 && n <= 199,
    },
    {
      value: "segundo_piso",
      label: "2° Piso",
      matcher: (n: number) => n >= 200 && n <= 299,
    },
    {
      value: "tercer_piso",
      label: "3° Piso",
      matcher: (n: number) => n >= 300 && n <= 399,
    },
    {
      value: "cuarto_piso",
      label: "4° Piso",
      matcher: (n: number) =>
        n >= 400 && n <= 430 && !(n >= 400 && n <= 410) && n != 472,
    },
    {
      value: "quinto_piso",
      label: "5° Piso",
      matcher: (n: number) => n >= 500 && n <= 599,
    },
    {
      value: "uti",
      label: "UTI (470,441,445, 417)",
      matcher: (n: number) => [470, 441, 445, 417].includes(n),
    },
    {
      value: "uco_rcv",
      label: "UCO/RCV (400-410, 41, 472)",
      matcher: (n: number) => (n >= 400 && n <= 410) || n === 41 || n == 472,
    },
  ];

  function extraerNumeroSala(sala: string): number | null {
    const match = sala.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

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
    setFiltroPiso("todos");
    setFiltroFecha(hoy);
    setPaginaActual(1);
    setEnCama(false);
  };

  const toggleEnCama = () => {
    setEnCama(!enCama);
    setFiltroLugar(enCama ? "todos" : "En Cama");
    setFiltroModalidad(enCama ? "todos" : "Radiografia");
    setFiltroEstado(enCama ? "todos" : "pendiente");
  };

  const toggleFiltros = () => {
    setShowFiltros((prev) => {
      localStorage.setItem("filtrosInternacion", String(!prev));
      return !prev;
    });
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

    const numSala = extraerNumeroSala(p.sala);
    const cumplePiso =
      filtroPiso === "todos" ||
      (numSala !== null &&
        GRUPOS_SALA.some((g) => g.value === filtroPiso && g.matcher(numSala)));

    return (
      cumpleBusqueda &&
      cumpleLugar &&
      cumpleModalidad &&
      cumpleEstado &&
      cumplePiso
    );
  });

  const totalPaginas = Math.ceil(pedidosFiltrados.length / ITEMS_POR_PAGINA);
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA,
  );

  const pedidosCardData: PedidoCardData[] = pedidosPaginados.map((p) => {
    const [dia, hora] = p.fecha.split(" ");
    const isFinalizado =
      p.comentario?.toLowerCase().includes("ok") ||
      p.comentario?.toLowerCase().includes("realiz");
    return {
      id: p.idEstudio,
      patientName: `${p.apellidos}, ${capitalize(p.nombres)}`,
      dni: p.dniString,
      date: dia,
      time: hora,
      studyType: p.tipoEstudio,
      studyDescription: p.solicitud,
      diagnosis: p.diagnostico,
      location: p.lugar,
      subLocation: p.sala || undefined,
      isUrgent: p.urgente?.toLowerCase() === "si",
      hasNotification: !!p.nota?.trim(),
      status: isFinalizado ? "realizado" : "pendiente",
    };
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
        className="bg-seccion-internacion min-h-screen flex flex-col font-sans"
      >
        {/* HEADER STICKY */}
        <div className="sticky top-16 z-10 shrink-0">
          <div className="p-4 md:p-2 pb-0">
            <div className="w-full mx-auto">
              {/* Fila única: Título + Recargar + Filtros + Acciones */}
              <div className="flex flex-wrap items-center gap-3 bg-emerald-900/90 dark:bg-emerald-950/85 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                <div className="items-center gap-2 shrink-0 hidden md:flex">
                  <div className="bg-white p-1.5 rounded-lg text-emerald-700 shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl font-black text-white tracking-tight uppercase whitespace-nowrap">
                    Internación
                  </h1>
                  <button
                    onClick={() =>
                      traerPedidosInternacion(true, filtroFecha, true)
                    }
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Recargar pedidos"
                  >
                    <RefreshCw
                      className={`w-6 h-6 ${refreshingInternacion ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="relative flex-grow min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700" />
                  <input
                    type="text"
                    className="block w-full pl-8 pr-3 py-3 bg-white dark:bg-card border-none rounded-lg text-emerald-900 dark:text-foreground placeholder-emerald-400 dark:placeholder-muted-foreground focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                    placeholder="Buscar por Paciente, DNI o Sala..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setPaginaActual(1);
                    }}
                  />
                </div>

                {showFiltros && (
                  <>
                    <div className="relative shrink-0">
                      <CalendarClock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-700 z-10" />
                      <input
                        type="date"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                        className="pl-8 pr-2 py-3 bg-white dark:bg-card border-none rounded-lg text-xs font-bold text-emerald-900 dark:text-foreground"
                      />
                    </div>

                    <select
                      value={filtroLugar}
                      onChange={(e) => {
                        setFiltroLugar(e.target.value);
                        setPaginaActual(1);
                      }}
                      className="px-3 py-3 bg-white dark:bg-card border-none rounded-lg text-sm font-bold text-emerald-900 dark:text-foreground shrink-0"
                    >
                      <option value="todos">Lugar</option>
                      {lugares.map((lugar) => (
                        <option key={lugar} value={lugar}>
                          {lugar}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filtroPiso}
                      onChange={(e) => {
                        setFiltroPiso(e.target.value);
                        setPaginaActual(1);
                      }}
                      className="px-3 py-3 bg-white dark:bg-card border-none rounded-lg text-sm font-bold text-emerald-900 dark:text-foreground shrink-0"
                    >
                      <option value="todos">Piso</option>
                      {GRUPOS_SALA.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filtroModalidad}
                      onChange={(e) => {
                        setFiltroModalidad(e.target.value);
                        setPaginaActual(1);
                      }}
                      className="px-3 py-3 bg-white dark:bg-card border-none rounded-lg text-sm font-bold text-emerald-900 dark:text-foreground shrink-0"
                    >
                      <option value="todos">Modalidad</option>
                      <option value="Radiografia">Radiografía</option>
                      <option value="Tomografia">Tomografía</option>
                      <option value="Ecografia">Ecografía</option>
                    </select>

                    <select
                      value={filtroEstado}
                      onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`px-3 py-3 border-none rounded-lg text-sm font-black transition-all shrink-0 ${
                        filtroEstado === "realizado"
                          ? "bg-emerald-600 dark:bg-emerald-800 text-white"
                          : filtroEstado === "pendiente"
                            ? "bg-red-600 dark:bg-red-800 text-white"
                            : "bg-white text-emerald-900 dark:bg-card dark:text-foreground"
                      }`}
                    >
                      <option value="todos">Estado</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="realizado">Realizados</option>
                    </select>
                  </>
                )}

                <button
                  onClick={toggleFiltros}
                  className={`p-2.5 rounded-lg transition-all shrink-0 ${
                    showFiltros
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  title={showFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                >
                  {showFiltros ? (
                    <EyeClosed className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={toggleEnCama}
                  className={`p-2.5 rounded-lg transition-all shrink-0 ${
                    enCama
                      ? "bg-red-700 dark:bg-red-900 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  title={
                    enCama ? "Todos los pedidos" : "Mostrar pedidos en Cama"
                  }
                >
                  {enCama ? (
                    <Bed className="w-6 h-6" />
                  ) : (
                    <Hospital className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={limpiarFiltros}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
                  title="Limpiar filtros"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 p-2 md:p-2">
          <div className="w-full mx-auto">
            {isLoading ? (
              <div className="bg-card rounded-xl shadow-2xl overflow-hidden border border-emerald-100 dark:border-emerald-950 py-20">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-40 h-40 flex items-center justify-center">
                    <img
                      src={spinnerGif}
                      alt="Cargando..."
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-emerald-900 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                    Cargando pedidos...
                  </span>
                </div>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="bg-card rounded-xl shadow-2xl overflow-hidden border border-emerald-100 dark:border-emerald-950 py-20">
                <div className="px-6 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto opacity-20 mb-2" />
                  <p className="font-medium">
                    No se encontraron pacientes para los filtros seleccionados.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Vista mobile: Tarjetas */}
                <div className="block md:hidden space-y-3">
                  {pedidosCardData.map((item) => (
                    <PedidoCard
                      key={item.id}
                      item={item}
                      accentColor="emerald"
                      onVerDetalle={() => {
                        const original = pedidosPaginados.find(
                          (p) => p.idEstudio === item.id,
                        );
                        if (original) handleVerDetalle(original);
                      }}
                      onToggleEstado={() => {
                        const original = pedidosPaginados.find(
                          (p) => p.idEstudio === item.id,
                        );
                        if (original) alternarEstadoPedido(original);
                      }}
                    />
                  ))}
                  <PaginationBar
                    currentPage={paginaActual}
                    totalPages={totalPaginas}
                    totalItems={pedidosFiltrados.length}
                    itemsPerPage={ITEMS_POR_PAGINA}
                    onPageChange={setPaginaActual}
                  />
                </div>

                {/* Vista desktop: Tabla */}
                <div className="hidden md:block bg-card rounded-xl overflow-x-auto shadow-2xl overflow-hidden border border-emerald-100 dark:border-emerald-950">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-emerald-900 dark:bg-emerald-950 text-white uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-bold text-center">
                          Fecha
                        </th>
                        <th className="px-6 py-4 font-bold text-center">
                          Paciente
                        </th>
                        <th className="px-6 py-4 font-bold text-center">
                          Estudio
                        </th>
                        <th className="px-6 py-4 font-bold text-center">
                          Ubicación
                        </th>
                        <th className="px-6 py-4 font-bold text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border [&>tr:nth-child(even)]:bg-muted">
                      {pedidosFiltrados.map((item) => (
                        <InternacionPedidoRow
                          key={item.idEstudio}
                          item={item}
                          onVerDetalle={handleVerDetalle}
                          onToggleEstado={alternarEstadoPedido}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER: Contadores */}
        <PedidosFooter
          titulo="Recuento de pedidos"
          contadores={[
            { tipo: "Total", valor: pedidosInternacion.length },
            { tipo: "Filtrados", valor: pedidosFiltrados.length },
            { tipo: "Radiografia", valor: conteoPorTipo.Radiografia },
            { tipo: "Tomografia", valor: conteoPorTipo.Tomografia },
            { tipo: "Ecografia", valor: conteoPorTipo.Ecografia },
          ]}
        />
      </div>

      <ModalDetalleInternacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pedido={pedidoSeleccionado}
        onGuardarNota={guardarNota}
      />
    </>
  );
}
