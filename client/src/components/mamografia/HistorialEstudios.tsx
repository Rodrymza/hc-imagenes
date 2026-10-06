import type { IEstudioConHallazgos } from "@/types/mamografia";
import { OrigenEnum } from "@/types/mamografia";
import { ANAMNESIS_LABELS } from "./anamnesisLabels";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Eye,
  Hospital,
  Stethoscope,
} from "lucide-react";

interface Props {
  estudios: IEstudioConHallazgos[];
  onVerDetalle?: (estudio: IEstudioConHallazgos) => void;
}

const formatearFecha = (fecha: string): string => {
  if (!fecha) return "-";
  const [anio, mes, dia] = fecha.split("-");
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
};

export function HistorialEstudios({ estudios, onVerDetalle }: Props) {
  if (estudios.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-bold">
          Sin estudios previos registrados para esta paciente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {estudios.map((estudio) => {
        const anamnesisConDatos = ANAMNESIS_LABELS.filter(
          (f) => estudio[f.key],
        );
        return (
          <details
            key={estudio.id}
            className="group rounded-xl border border-border bg-card overflow-hidden"
          >
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-3 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-colors">
              <div className="flex items-center gap-2 min-w-fit">
                <CalendarDays className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                <span className="text-sm font-black text-foreground">
                  {formatearFecha(estudio.fecha_estudio)}
                </span>
              </div>
              <span className="flex-1 text-sm font-bold text-foreground/90 truncate">
                {estudio.tipo_estudio}
              </span>
              {estudio.turno && (
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  {estudio.turno}
                </span>
              )}
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {estudio.origen === OrigenEnum.INTERNADO ? "Internado" : "CE"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-500 text-white">
                {estudio.hallazgos.length} hallazgo
                {estudio.hallazgos.length === 1 ? "" : "s"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
              <div className="flex items-center justify-between gap-3">
                {estudio.numero_estudio ? (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    N° de estudio: {estudio.numero_estudio}
                  </p>
                ) : (
                  <span />
                )}
                {estudio.registrado_por && (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide truncate">
                    Registrado por: {estudio.registrado_por}
                  </p>
                )}
                {onVerDetalle && (
                  <button
                    type="button"
                    onClick={() => onVerDetalle(estudio)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all active:scale-95"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver detalle
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" /> Hallazgos
                </h4>
                {estudio.hallazgos.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Sin hallazgos registrados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {estudio.hallazgos.map((h) => (
                      <li
                        key={h.id}
                        className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-2"
                      >
                        <p className="text-[11px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
                          {h.mama} · {h.cuadrante}
                        </p>
                        {h.tipo_hallazgo && (
                          <p className="text-sm font-bold text-foreground">
                            {h.tipo_hallazgo}
                          </p>
                        )}
                        {h.observaciones && (
                          <p className="text-xs text-muted-foreground">
                            {h.observaciones}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {anamnesisConDatos.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                    <Hospital className="h-4 w-4" /> Anamnesis
                  </h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {anamnesisConDatos.map((f) => (
                      <div key={f.key} className="flex justify-between gap-2 text-xs">
                        <dt className="text-muted-foreground font-bold">
                          {f.label}
                        </dt>
                        <dd className="text-foreground font-semibold text-right">
                          {String(estudio[f.key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}