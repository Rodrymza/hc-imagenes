import { useCallback, useEffect, useMemo, useState } from "react";
import { MamografiaService } from "@/services/mamografia.service";
import {
  BarChart3,
  Download,
  RotateCcw,
} from "lucide-react";
import type {
  IEstadisticaRow,
  TurnoEnum,
} from "@/types/mamografia";
import { TurnoEnum as Turnos } from "@/types/mamografia";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const inicioMesISO = () => {
  const ahora = new Date();
  const iso = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`;
  return iso;
};

const INPUT_CLASS =
  "px-3 py-2 border border-input bg-card rounded-lg text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent";

export function EstadisticasMamografia() {
  const [desde, setDesde] = useState(inicioMesISO);
  const [hasta, setHasta] = useState(hoyISO);
  const [turno, setTurno] = useState<string>("");
  const [rangoAplicado, setRangoAplicado] = useState({
    desde: inicioMesISO(),
    hasta: hoyISO(),
    turno: "",
  });
  const [filas, setFilas] = useState<IEstadisticaRow[]>([]);
  const [cargando, setCargando] = useState(false);

  const aplicarFiltros = () => {
    setRangoAplicado({ desde, hasta, turno });
  };

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setCargando(true);
      try {
        const datos = await MamografiaService.getEstadisticas({
          desde: rangoAplicado.desde,
          hasta: rangoAplicado.hasta,
          turno: (rangoAplicado.turno as TurnoEnum) || null,
        });
        if (!cancelado) setFilas(datos);
      } catch (error) {
        if (!cancelado) {
          toast.error(`Error al cargar estadísticas: ${getErrorMessage(error)}`);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [rangoAplicado]);

  const totales = useMemo(
    () =>
      filas.reduce(
        (acc, f) => ({
          ce: acc.ce + f.ce,
          internado: acc.internado + f.internado,
          total: acc.total + f.total,
        }),
        { ce: 0, internado: 0, total: 0 },
      ),
    [filas],
  );

  const exportarCSV = useCallback(() => {
    const encabezado = [
      "Tipo de Estudio",
      "Consultorio Externo",
      "Internado",
      "Total",
    ];
    const cuerpo = filas.map((f) => [f.tipo_estudio, f.ce, f.internado, f.total]);
    const lineaTotal = ["TOTAL", totales.ce, totales.internado, totales.total];

    const contenido = [encabezado, ...cuerpo, lineaTotal]
      .map((fila) => fila.join(";"))
      .join("\n");

    const blob = new Blob([`\uFEFF${contenido}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estadisticas_mamografia_${rangoAplicado.desde}_${rangoAplicado.hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Estadisticas exportadas a CSV");
  }, [filas, totales, rangoAplicado]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
        <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Rango de fechas
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
              Turno
            </label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
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
              Calcular
            </button>
            <button
              type="button"
              onClick={exportarCSV}
              disabled={filas.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Exportar CSV
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
                  Tipo de Estudio
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Consultorio Externo
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Internado
                </th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filas.map((f) => (
                    <tr key={f.tipo_estudio} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20">
                      <td className="px-4 py-2.5 font-bold text-foreground">
                        {f.tipo_estudio}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-foreground">
                        {f.ce}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-foreground">
                        {f.internado}
                      </td>
                      <td className="px-4 py-2.5 text-center font-black text-rose-600 dark:text-rose-400">
                        {f.total}
                      </td>
                    </tr>
                  ))}
              <tr className="bg-rose-500 text-white">
                <td className="px-4 py-3 font-black uppercase tracking-widest">
                  Total
                </td>
                <td className="px-4 py-3 text-center font-black">{totales.ce}</td>
                <td className="px-4 py-3 text-center font-black">
                  {totales.internado}
                </td>
                <td className="px-4 py-3 text-center font-black">{totales.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}