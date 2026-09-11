import { Clock, CheckCircle2 } from "lucide-react";
import type { IDetallePedidoGuardia } from "@/types/pedidos";
import { getEstiloEstudio } from "./utils";

interface PedidoGuardiaCardProps {
  pedido: IDetallePedidoGuardia;
}

export function PedidoGuardiaCard({ pedido }: PedidoGuardiaCardProps) {
  const estilo = getEstiloEstudio(pedido.tipoEstudio);

  return (
    <div
      className={`${pedido.realizado ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900" : "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800"} rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex flex-col items-center justify-center rounded-lg py-2 px-3 min-w-[60px] ${pedido.realizado ? "bg-emerald-100 dark:bg-emerald-950/60" : "bg-orange-100 dark:bg-orange-950/60"}`}
        >
          <Clock
            className={`w-4 h-4 mb-1 ${pedido.realizado ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}`}
          />
          <span
            className={`text-[10px] text-center font-black whitespace-pre-line ${pedido.realizado ? "text-emerald-800 dark:text-emerald-300" : "text-orange-800 dark:text-orange-300"}`}
          >
            {pedido.fecha.split(" ")[0] || "---"}
            {"\n"}
            {pedido.fecha.split(" ")[1] || "---"}
          </span>
        </div>

        <div>
          <h4
            className={`text-sm font-black uppercase leading-tight ${pedido.realizado ? "text-emerald-900 dark:text-emerald-200" : "text-foreground"}`}
          >
            {pedido.pedido}
          </h4>
          <p
            className={`text-[11px] mt-0.5 ${pedido.realizado ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
          >
            Solicita:{" "}
            <span
              className={`font-bold ${pedido.realizado ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"}`}
            >
              {pedido.doctor}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-sm px-2 py-0.5 rounded font-bold uppercase border ${pedido.realizado ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800" : "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"}`}
            >
              {pedido.realizado ? "Realizado" : "Pendiente"}
            </span>
          </div>
        </div>
      </div>

      <span
        className={`flex items-center gap-2  p-2 font-bold ${pedido.realizado ? "bg-emerald-600 dark:bg-emerald-700 text-white border border-emerald-700 dark:border-emerald-800" : estilo.badge} py-2 rounded-lg text-xs transition-all shadow-sm active:scale-95`}
      >
        {pedido.realizado ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          estilo.icon
        )}
        {pedido.tipoEstudio}
      </span>
    </div>
  );
}
