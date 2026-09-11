import { useState, useRef, useEffect } from "react";
import {
  X,
  Zap,
  Search,
  Save,
  Loader2,
  AlertCircle,
  Radiation,
} from "lucide-react";
import type { IConsumoItem } from "@/types/interno";
import type { Exposicion } from "@/hooks/useConsumos";

interface PanelConsumosProps {
  exposiciones: Exposicion[];
  prestaciones: IConsumoItem[];
  onAdd: (item: IConsumoItem) => void;
  onRemove: (descripcion: string) => void;
  onConfirm: () => void;
  isSaving: boolean;
  disabled?: boolean;
  hideConfirmButton?: boolean;
}

export const PanelConsumos = ({
  exposiciones,
  prestaciones,
  onAdd,
  onRemove,
  onConfirm,
  isSaving,
  disabled = false,
  hideConfirmButton = false,
}: PanelConsumosProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setMostrarResultados(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const resultados =
    busqueda.length > 1
      ? prestaciones
          .filter((p) =>
            normalizar(p.descripcion).includes(busqueda.toUpperCase()),
          )
          .slice(0, 5)
      : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mostrarResultados || resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < resultados.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && resultados[selectedIndex]) {
        onAdd(resultados[selectedIndex]);
        setBusqueda("");
        setMostrarResultados(false);
        setSelectedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setMostrarResultados(false);
      setSelectedIndex(-1);
    }
  };

  return (
    // Quitamos los bordes superiores y sombras duras para que sea un bloque interno limpio
    <div className="bg-card p-5 w-full">
      <div className="flex flex-col gap-3">
        {/* BUSCADOR MANUAL (Ahora es full-width y apilado) */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
            Consumos a Imputar
          </h4>

          <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                placeholder="Buscar prestación manual..."
                className="w-full pl-10 pr-4 py-3 text-sm border-2 border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 bg-muted/50 text-foreground placeholder:text-muted-foreground font-medium transition-all"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMostrarResultados(true);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setMostrarResultados(true)}
                disabled={disabled}
              />
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Dropdown de Resultados */}
            {mostrarResultados && busqueda.length > 1 && (
              <div className="absolute top-full mt-2 left-0 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                {resultados.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center font-medium">
                    No se encontraron resultados
                  </div>
                ) : (
                  resultados.map((res, index) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        onAdd(res);
                        setBusqueda("");
                        setMostrarResultados(false);
                        setSelectedIndex(-1);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-border/50 last:border-0 font-bold
                        ${
                          index === selectedIndex
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-foreground"
                        }`}
                    >
                      {res.descripcion}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* LISTA DE CHIPS (Área de drop/selección más limpia) */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Exposiciones Seleccionadas
          </span>
          <div className="flex flex-col gap-2 min-h-[80px] bg-muted/50 p-3 rounded-xl border-2 border-dashed border-border">
            {exposiciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-full py-4 opacity-60">
                <AlertCircle className="w-8 h-8 stroke-1" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Sin consumos
                </span>
              </div>
            ) : (
              exposiciones.map((exp, index) => (
                <div
                  key={`${exp.id}-${index}`}
                  className={`
                    flex items-center justify-between pl-3 pr-2 py-2 rounded-lg border shadow-sm animate-in zoom-in-95 duration-200
                    ${
                      exp.origen === "AUTO"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                        : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    {exp.origen === "AUTO" ? (
                      <Zap className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
                    ) : (
                      <Radiation className="w-5 h-5 text-indigo-500 shrink-0" />
                    )}
                    <span className="text-sm font-bold truncate">
                      {exp.descripcion}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(exp.descripcion)}
                    disabled={disabled || isSaving}
                    className="p-1.5 hover:bg-white/60 dark:hover:bg-white/10 rounded-md transition-colors text-muted-foreground shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTON DE ACCION (Full width para diseño de columna) */}
        {!hideConfirmButton && (
          <div className="pt-2">
            <button
              onClick={onConfirm}
              disabled={exposiciones.length === 0 || isSaving || disabled}
              className={`
                flex items-center justify-center gap-3 w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all
                ${
                  exposiciones.length === 0 || disabled || isSaving
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                }
              `}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando consumos al sistema...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enviar a Worklist ({exposiciones.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
