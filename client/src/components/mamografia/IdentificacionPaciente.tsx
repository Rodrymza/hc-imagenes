import { Fingerprint, Search, UserRound, X } from "lucide-react";
import type { IPacienteMamografia } from "@/types/mamografia";
import { capitalize } from "../pedidos/utils";

interface Props {
  dni: string;
  onDniChange: (v: string) => void;
  buscando: boolean;
  onBuscar: () => void;
  onCancelar: () => void;
  errorBusqueda: string | null;
  onIrADatos: () => void;
  paciente: IPacienteMamografia | null;
  onCambiarPaciente: () => void;
}

const LABEL_CLASS =
  "block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide";
const INPUT_CLASS =
  "w-full px-3 py-2 border border-input bg-card rounded-lg text-sm font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-muted/40";

export function IdentificacionPaciente({
  dni,
  onDniChange,
  buscando,
  onBuscar,
  onCancelar,
  errorBusqueda,
  onIrADatos,
  paciente,
  onCambiarPaciente,
}: Props) {
  if (paciente) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
              <Fingerprint className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground leading-tight">
                {capitalize(paciente.apellido)}, {capitalize(paciente.nombre)}
              </p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                DNI {paciente.dni}
                {paciente.fecha_nacimiento
                  ? ` · Nac. ${paciente.fecha_nacimiento}`
                  : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCambiarPaciente}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-600 dark:text-rose-300 border-2 border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all active:scale-95"
          >
            <UserRound className="h-3.5 w-3.5" /> Nuevo Registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
      <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-4">
        Identificación de la paciente
      </h3>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className={LABEL_CLASS}>DNI</label>
          <input
            type="text"
            inputMode="numeric"
            value={dni}
            onChange={(e) => onDniChange(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && onBuscar()}
            disabled={buscando}
            placeholder="Ingrese el DNI..."
            className={INPUT_CLASS}
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={onBuscar}
          disabled={buscando}
          className="flex items-center gap-2 px-6 py-2 text-sm font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-none active:scale-95"
        >
          {buscando ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Buscando
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Buscar
            </>
          )}
        </button>
      </div>

      {(errorBusqueda || buscando) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          {errorBusqueda && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {errorBusqueda}
            </p>
          )}
          {buscando ? (
            <button
              type="button"
              onClick={onCancelar}
              className="text-xs font-bold text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Cancelar búsqueda
            </button>
          ) : (
            errorBusqueda && (
              <button
                type="button"
                onClick={onIrADatos}
                className="text-xs font-bold text-muted-foreground underline underline-offset-2 hover:text-rose-500 transition-colors"
              >
                Completar los datos manualmente ›
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
