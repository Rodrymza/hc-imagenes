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
      className={`${pedido.realizado ? "bg-emerald-50 border-emerald-200" : "bg-orange-200 border-orange-400"} rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex flex-col items-center justify-center rounded-lg py-2 px-3 min-w-[60px] ${pedido.realizado ? "bg-emerald-100" : "bg-amber-100"}`}
        >
          <Clock
            className={`w-4 h-4 mb-1 ${pedido.realizado ? "text-emerald-600" : "text-amber-600"}`}
          />
          <span
            className={`text-[10px] text-center font-black whitespace-pre-line ${pedido.realizado ? "text-emerald-800" : "text-amber-800"}`}
          >
            {pedido.fecha.split(" ")[0] || "---"}
            {"\n"}
            {pedido.fecha.split(" ")[1] || "---"}
          </span>
        </div>

        <div>
          <h4
            className={`text-sm font-black uppercase leading-tight ${pedido.realizado ? "text-emerald-900" : "text-slate-800"}`}
          >
            {pedido.pedido}
          </h4>
          <p
            className={`text-[11px] mt-0.5 ${pedido.realizado ? "text-emerald-600" : "text-slate-500"}`}
          >
            Solicita:{" "}
            <span
              className={`font-bold ${pedido.realizado ? "text-emerald-700" : "text-slate-700"}`}
            >
              {pedido.doctor}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-sm ${pedido.realizado ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"} px-2 py-0.5 rounded font-bold uppercase`}
            >
              {pedido.realizado ? "Realizado" : "Pendiente"}
            </span>
          </div>
        </div>
      </div>

      <span
        className={`flex items-center gap-2  p-2 font-bold ${pedido.realizado ? "bg-emerald-600 text-white border border-emerald-700" : `${estilo.badge} ${estilo.text} ${estilo.bg} ${estilo.border}`} py-2 rounded-lg text-xs transition-all shadow-sm active:scale-95`}
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
