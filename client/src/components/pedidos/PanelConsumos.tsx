import { useState, useRef, useEffect } from "react";
import {
  X,
  Plus,
  Zap,
  Search,
  Save,
  Loader2,
  AlertCircle,
  Bone,
  Radiation,
} from "lucide-react";
import type { IConsumoItem } from "@/types/interno";

interface PanelConsumosProps {
  exposiciones: IConsumoItem[];
  prestaciones: IConsumoItem[]; // El catálogo completo para buscar
  onAdd: (item: IConsumoItem) => void;
  onRemove: (id: string) => void;
  onConfirm: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export const PanelConsumos = ({
  exposiciones,
  prestaciones,
  onAdd,
  onRemove,
  onConfirm,
  isSaving,
  disabled = false,
}: PanelConsumosProps) => {
  // Estado local para el buscador manual
  const [busqueda, setBusqueda] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar buscador si clic fuera
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
  // Filtrar catálogo (Top 5 resultados para no saturar)
  const resultados =
    busqueda.length > 1
      ? prestaciones
          .filter((p) =>
            normalizar(p.descripcion).includes(busqueda.toUpperCase()),
          )
          .slice(0, 5)
      : [];

  return (
    <div className="bg-indigo-50/50 border-t-4 border-indigo-500 p-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-20 relative">
      <div className="flex flex-col gap-4">
        {/* TITULO Y BUSCADOR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Consumos a Imputar
          </h4>

          {/* Buscador Manual */}
          <div className="relative w-full sm:w-64" ref={wrapperRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Agregar prestación manual..."
                className="w-full pl-8 pr-3 py-1.5 text-base border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMostrarResultados(true);
                }}
                onFocus={() => setMostrarResultados(true)}
                disabled={disabled}
              />
              <Search className="w-4 h-4 text-indigo-400 absolute left-2.5 top-2" />
            </div>

            {/* Dropdown de Resultados */}
            {mostrarResultados && busqueda.length > 1 && (
              <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {resultados.length === 0 ? (
                  <div className="p-3 text-base text-slate-400 text-center">
                    No se encontraron resultados
                  </div>
                ) : (
                  resultados.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        onAdd(res);
                        setBusqueda("");
                        setMostrarResultados(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors border-b border-slate-50 last:border-0"
                    >
                      {res.descripcion}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* LISTA DE CHIPS */}
        <div className="flex flex-wrap gap-2 min-h-[40px] items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
          {exposiciones.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-600 text-base italic w-full justify-center py-1">
              <AlertCircle className="w-7 h-7" />
              Esperando carga manual...
            </div>
          ) : (
            exposiciones.map((exp, index) => (
              <div
                key={`${exp.id}-${index}`}
                className={`
                  flex items-center gap-2 pl-3 pr-1 py-1 rounded-lg border shadow-sm animate-in zoom-in-95 duration-200 
                  ${
                    (exp as any).origen === "AUTO"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-violet-50 border-violet-500 text-violet-800"
                  }
                `}
              >
                {(exp as any).origen === "AUTO" ? (
                  <Zap className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                ) : (
                  <Radiation className="w-7 h-7 text-slate-800 fill-yellow-300" />
                )}

                <span className="text-sm font-bold">{exp.descripcion}</span>
                <button
                  onClick={() => onRemove(exp.descripcion)}
                  disabled={disabled || isSaving}
                  className="p-1 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* BOTON DE ACCION */}
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            disabled={exposiciones.length === 0 || isSaving || disabled}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all w-full sm:w-auto justify-center
              ${
                exposiciones.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 hover:shadow-lg ring-offset-2 focus:ring-2 ring-indigo-500"
              }
            `}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enviar a Worklist ({exposiciones.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
