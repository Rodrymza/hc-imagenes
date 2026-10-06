import { useState } from "react";
import type { IHallazgoPayload } from "@/types/mamografia";
import { MamaEnum } from "@/types/mamografia";
import { CircleAlert, Trash2, X } from "lucide-react";

interface Props {
  mama: MamaEnum;
  cuadrante: string;
  inicial?: IHallazgoPayload | null;
  onClose: () => void;
  onGuardar: (hallazgo: IHallazgoPayload) => void;
  onEliminar: () => void;
}

const SUGERENCIAS = [
  "Nódulo",
  "Microcalcificaciones",
  "Asimetría",
  "Densidad asimétrica",
  "Distorsión de la arquitectura",
  "Cicatriz quirúrgica",
  "Radiodensidad",
  "Adenopatía",
  "Quiste",
  "Otro",
];

export function ModalHallazgo({
  mama,
  cuadrante,
  inicial,
  onClose,
  onGuardar,
  onEliminar,
}: Props) {
  const [tipo, setTipo] = useState(inicial?.tipo_hallazgo ?? "");
  const [observaciones, setObservaciones] = useState(
    inicial?.observaciones ?? "",
  );

  const puedeGuardar = tipo.trim().length > 0 || observaciones.trim().length > 0;

  const guardar = () => {
    if (!puedeGuardar) return;
    onGuardar({
      mama,
      cuadrante,
      tipo_hallazgo: tipo.trim() || null,
      observaciones: observaciones.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-wide">
                {cuadrante}
              </h2>
              <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase">
                {mama}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground/90 mb-1">
              Tipo de hallazgo
            </label>
            <input
              type="text"
              list="tipos-hallazgo"
              autoFocus
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ej: Nódulo, Microcalcificaciones..."
              className="w-full px-4 py-2.5 border border-input bg-transparent rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />
            <datalist id="tipos-hallazgo">
              {SUGERENCIAS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/90 mb-1">
              Observaciones
            </label>
            <textarea
              rows={4}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Descripción, tamaño, márgenes, etc."
              className="w-full px-4 py-2.5 border border-input bg-transparent rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {inicial && (
              <button
                type="button"
                onClick={onEliminar}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Quitar
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={!puedeGuardar}
              className="px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-600 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-none active:scale-95"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}