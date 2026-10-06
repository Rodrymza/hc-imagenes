import { cn } from "@/lib/utils";
import type { IHallazgoPayload } from "@/types/mamografia";
import { CuadranteEnum, MamaEnum } from "@/types/mamografia";
import { CircleAlert, Plus } from "lucide-react";

interface Props {
  hallazgos: Record<string, IHallazgoPayload>;
  onSeleccionar: (mama: MamaEnum, cuadrante: string) => void;
}

const POSICIONES: { cuadrante: CuadranteEnum; label: string }[] = [
  { cuadrante: CuadranteEnum.SUPEROEXTERNO, label: "Superoexterno" },
  { cuadrante: CuadranteEnum.SUPEROINTERNO, label: "Superointerno" },
  { cuadrante: CuadranteEnum.INFEROEXTERNO, label: "Inferoexterno" },
  { cuadrante: CuadranteEnum.INFEROINTERNO, label: "Inferointerno" },
];

const RETRO = {
  cuadrante: CuadranteEnum.RETROAREOLAR_AXILAR,
  label: "Retroareolar / Axilar",
};

const keyFor = (mama: MamaEnum, cuadrante: string) => `${mama}|${cuadrante}`;

export function SelectorCuadrantes({ hallazgos, onSeleccionar }: Props) {
  const renderizarMama = (mama: MamaEnum) => (
    <div className="flex-1 min-w-0">
      <h3
        className={cn(
          "text-center text-sm font-black uppercase tracking-widest mb-3",
          mama === MamaEnum.DERECHA
            ? "text-rose-500 dark:text-rose-400"
            : "text-pink-600 dark:text-pink-400",
        )}
      >
        {mama}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {POSICIONES.map((pos) => {
          const key = keyFor(mama, pos.cuadrante);
          const hallazgo = hallazgos[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSeleccionar(mama, pos.cuadrante as CuadranteEnum)}
              className={cn(
                "rounded-xl border-2 p-3 min-h-[92px] flex flex-col items-center justify-center text-center transition-all active:scale-95",
                hallazgo
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 shadow-md shadow-rose-100 dark:shadow-none"
                  : "border-border bg-card hover:border-rose-300 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-muted-foreground",
              )}
            >
              {hallazgo ? (
                <>
                  <CircleAlert className="h-5 w-5 text-rose-500 dark:text-rose-400 mb-1" />
                  <span className="text-[11px] font-black uppercase leading-tight text-rose-700 dark:text-rose-300">
                    {pos.label}
                  </span>
                  <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 mt-1 line-clamp-2">
                    {hallazgo.tipo_hallazgo}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mb-1" />
                  <span className="text-[11px] font-black uppercase leading-tight">
                    {pos.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onSeleccionar(mama, RETRO.cuadrante)}
        className={cn(
          "mt-2 w-full rounded-xl border-2 p-3 flex items-center justify-center gap-2 text-center transition-all active:scale-95",
          hallazgos[keyFor(mama, RETRO.cuadrante)]
            ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 shadow-md shadow-rose-100 dark:shadow-none"
            : "border-border bg-card hover:border-rose-300 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-muted-foreground",
        )}
      >
        {hallazgos[keyFor(mama, RETRO.cuadrante)] ? (
          <>
            <CircleAlert className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            <span className="text-[11px] font-black uppercase text-rose-700 dark:text-rose-300">
              {RETRO.label}
            </span>
            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 truncate">
              {hallazgos[keyFor(mama, RETRO.cuadrante)].tipo_hallazgo}
            </span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase">{RETRO.label}</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {renderizarMama(MamaEnum.DERECHA)}
      <div className="hidden sm:block w-px bg-border self-stretch" />
      {renderizarMama(MamaEnum.IZQUIERDA)}
    </div>
  );
}