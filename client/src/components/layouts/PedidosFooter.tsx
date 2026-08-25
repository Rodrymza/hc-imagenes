import CountPill from "@/components/CountPill";
import type { TipoEstudio } from "@/components/CountPill";

interface PedidosFooterProps {
  titulo: string;
  contadores: { tipo: TipoEstudio; valor: number }[];
  accent?: "emerald" | "red";
}

export function PedidosFooter({
  titulo,
  contadores,
  accent = "emerald",
}: PedidosFooterProps) {
  const bg =
    accent === "red"
      ? "bg-red-900/90 dark:bg-red-950/90"
      : "bg-emerald-900/90 dark:bg-emerald-950/90";

  return (
    <div className="sticky bottom-0 z-10 shrink-0">
      <div
        className={`flex flex-wrap justify-around items-center gap-x-3 gap-y-1 px-3 py-1.5 ${bg} backdrop-blur-sm border-t border-white/20`}
      >
        <p className="text-[11px] text-white/50 hidden md:inline">
          &copy; {new Date().getFullYear()} Sistema de Gestión de Imágenes.
        </p>
        <div className="flex justify-center gap-3 items-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
            {titulo}
          </span>
          {contadores.map((c) => (
            <CountPill key={c.tipo} tipo={c.tipo} valor={c.valor} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-white/60">
            Sistema Operativo
          </span>
        </div>
      </div>
    </div>
  );
}
