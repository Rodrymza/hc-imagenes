import { useEffect, useState } from "react";
import { MamografiaService } from "@/services/mamografia.service";
import { CalendarDays, ListFilter, RotateCcw, Table2 } from "lucide-react";
import type {
  IEstudioDetalle,
  IFiltrosRegistros,
  IPaginacionRegistros,
  TurnoEnum,
} from "@/types/mamografia";
import { TurnoEnum as Turnos, OrigenEnum } from "@/types/mamografia";
import { DetalleEstudio } from "./DetalleEstudio";
import PaginationBar from "@/components/PaginationBar";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useAuth } from "@/context/AuthContext";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const inicioMesISO = () => {
  const ahora = new Date();
  const iso = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`;
  return iso;
};

const OPT_POR_PAGINA = [10, 15, 25, 50];

const INPUT_CLASS =
  "px-3 py-2 border border-input bg-card rounded-lg text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent";

const formatearFecha = (fecha: string): string => {
  const [anio, mes, dia] = fecha.split("-");
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
};

const filtrosIniciales = (): IFiltrosRegistros => ({
  q: "",
  desde: inicioMesISO(),
  hasta: hoyISO(),
  turno: null,
  porPagina: 15,
});

export function RegistrosMamografia() {
  const { isAdminMode, user } = useAuth();
  const puedeEliminar = isAdminMode || user?.rol === "MAMO";
  const [borrador, setBorrador] = useState<IFiltrosRegistros>(filtrosIniciales);
  const [aplicados, setAplicados] =
    useState<IFiltrosRegistros>(filtrosIniciales);
  const [datos, setDatos] = useState<IPaginacionRegistros | null>(null);
  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState<IEstudioDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [eliminandoDetalle, setEliminandoDetalle] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setCargando(true);
      try {
        const resultado = await MamografiaService.getRegistros(aplicados);
        if (!cancelado) setDatos(resultado);
      } catch (error) {
        if (!cancelado) {
          toast.error(
            `Error al cargar los registros: ${getErrorMessage(error)}`,
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [aplicados, recarga]);

  const aplicarFiltros = () => {
    setAplicados({ ...borrador, pagina: 1 });
  };

  const limpiarFiltros = () => {
    const limpios = filtrosIniciales();
    setBorrador(limpios);
    setAplicados({ ...limpios, pagina: 1 });
  };

  const irAPagina = (pagina: number) => {
    setAplicados((prev) => ({ ...prev, pagina }));
  };

  const cambiarTamano = (porPagina: number) => {
    setBorrador((prev) => ({ ...prev, porPagina }));
    setAplicados((prev) => ({ ...prev, porPagina, pagina: 1 }));
  };

  const verDetalle = async (id: number) => {
    setCargandoDetalle(true);
    setDetalle(null);
    try {
      const resultado = await MamografiaService.getEstudio(id);
      setDetalle(resultado);
    } catch (error) {
      toast.error(`Error al cargar el estudio: ${getErrorMessage(error)}`);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const eliminarEstudio = async () => {
    if (!detalle) return;
    setEliminandoDetalle(true);
    try {
      const res = await MamografiaService.eliminarEstudio(detalle.id);
      toast.success(res.message);
      setDetalle(null);
      setRecarga((prev) => prev + 1);
    } catch (error) {
      toast.error(`Error al eliminar el estudio: ${getErrorMessage(error)}`);
    } finally {
      setEliminandoDetalle(false);
    }
  };

  const total = datos?.total ?? 0;
  const totalPaginas = datos?.totalPaginas ?? 0;
  const pagina = datos?.pagina ?? 1;
  const porPagina = datos?.porPagina ?? aplicados.porPagina ?? 15;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
        <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2">
          <ListFilter className="h-4 w-4" /> Filtros
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Buscar por DNI, apellido o nombre
            </label>
            <input
              type="text"
              value={borrador.q ?? ""}
              onChange={(e) =>
                setBorrador((prev) => ({ ...prev, q: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") aplicarFiltros();
              }}
              placeholder="Ej: 26.550.123 o González"
              className={`${INPUT_CLASS} w-full`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Desde
            </label>
            <input
              type="date"
              value={borrador.desde ?? ""}
              onChange={(e) =>
                setBorrador((prev) => ({ ...prev, desde: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Hasta
            </label>
            <input
              type="date"
              value={borrador.hasta ?? ""}
              onChange={(e) =>
                setBorrador((prev) => ({ ...prev, hasta: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Turno
            </label>
            <select
              value={borrador.turno ?? ""}
              onChange={(e) =>
                setBorrador((prev) => ({
                  ...prev,
                  turno:
                    e.target.value === ""
                      ? null
                      : (e.target.value as TurnoEnum),
                }))
              }
              className={INPUT_CLASS}
            >
              <option value="">Todos</option>
              <option value={Turnos.MANANA}>Mañana</option>
              <option value={Turnos.TARDE}>Tarde</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={aplicarFiltros}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-none active:scale-95"
            >
              {cargando ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Buscar
            </button>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-100/70 dark:bg-rose-950/40 text-left">
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Fecha
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  DNI
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Paciente
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  N° Estudio
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Turno
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Origen
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Tipo de Estudio
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Registrado por
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Hallazgos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando
                ? Array.from({ length: porPagina }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={9} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : (datos?.items ?? []).map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20 cursor-pointer"
                      onClick={() => verDetalle(r.id)}
                    >
                      <td className="px-4 py-2.5 font-bold text-foreground whitespace-nowrap flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-rose-400" />
                        {formatearFecha(r.fecha_estudio)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-muted-foreground whitespace-nowrap">
                        {r.dni}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-foreground whitespace-nowrap">
                        {r.apellido}, {r.nombre}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-foreground">
                        {r.numero_estudio ?? "-"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {r.turno ? (
                          <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {r.turno}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            r.origen === OrigenEnum.INTERNADO
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.origen === OrigenEnum.INTERNADO
                            ? "Internado"
                            : "CE"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-foreground">
                        {r.tipo_estudio}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-muted-foreground whitespace-nowrap">
                        {r.registrado_por ?? "-"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          {r.cantidad_hallazgos}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!cargando && total === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Table2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">
                No hay registros con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>

        {!cargando && total > 0 && (
          <div className="border-t border-border px-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 pt-3 sm:pt-0 order-2 sm:order-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Por página
              </label>
              <select
                value={porPagina}
                onChange={(e) => cambiarTamano(Number(e.target.value))}
                className="px-2 py-1.5 border border-input bg-card rounded-lg text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {OPT_POR_PAGINA.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 order-1 sm:order-2">
              <PaginationBar
                variant="rose"
                currentPage={pagina}
                totalPages={totalPaginas}
                totalItems={total}
                itemsPerPage={porPagina}
                onPageChange={irAPagina}
              />
            </div>
          </div>
        )}
      </div>

      {(detalle || cargandoDetalle) && (
        <DetalleEstudio
          estudio={detalle}
          cargando={cargandoDetalle}
          mostrarDatosPaciente
          onEliminar={puedeEliminar ? eliminarEstudio : undefined}
          eliminando={eliminandoDetalle}
          onClose={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
