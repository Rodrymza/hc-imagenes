import {
  AlertTriangle,
  Activity,
  Clock,
  Stethoscope,
} from "lucide-react";
import type { IDetallePedidoGuardia } from "@/types/pedidos";
import { getEstiloEstudio } from "./utils";
import { BotonTransferirPedido } from "./BotonTransferirPedido";
import type { EstadoPedido } from "@/utils/pedidos";

interface EstudioCardMobileProps {
  pedido: IDetallePedidoGuardia;
  estado: EstadoPedido;
  procesando: boolean;
  onTransferir: (idEstudio: string) => void;
}

export const EstudioCardMobile = ({
  pedido,
  estado,
  procesando,
  onTransferir,
}: EstudioCardMobileProps) => {
  const estilo = getEstiloEstudio(pedido.tipoEstudio);
  const esActivo = estado === "activo";

  const containerClase = esActivo
    ? estilo.border
    : "border-slate-200 dark:border-slate-800";

  const headerFooterClase = esActivo
    ? `${estilo.border} ${estilo.bg}`
    : "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800";

  const apagado = esActivo ? "" : "opacity-60 grayscale";

  return (
    <div
      className={`bg-card rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${containerClase} ${apagado}`}
    >
      {/* Header Tarjeta */}
      <div className={`p-2.5 border-b ${headerFooterClase}`}>
        <div className="flex justify-between items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest ${
              esActivo ? estilo.badge : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {esActivo ? estilo.icon : <Clock className="w-4 h-4" />}
            {pedido.tipoEstudio}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bold bg-white/50 dark:bg-white/10 px-3 py-1 rounded-md">
            <Clock className="w-4 h-4" />
            <span>{pedido.fecha}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-3 space-y-2 bg-card">
        <h3 className="text-base text-center py-1 font-bold leading-snug whitespace-pre-line text-foreground">
          {pedido.pedido}
        </h3>

        <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-1 rounded-xl border border-amber-100 dark:border-amber-900">
          <Activity className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <span className="w-24 text-xs text-center font-black text-muted-foreground uppercase tracking-wide shrink-0">
            Diagnóstico:
          </span>
          <p className="text-sm text-foreground">
            {pedido.diagnostico || "Sin diagnóstico especificado"}
          </p>
        </div>

        {pedido.observaciones && (
          <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-1 rounded-xl border border-amber-100 dark:border-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="w-24 text-xs text-center tracking-wide font-black text-amber-700/70 dark:text-amber-400/80 uppercase block shrink-0">
              Observaciones:
            </span>
            <p className="text-sm font-medium text-foreground/90">
              {pedido.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-3 py-1 border-t ${headerFooterClase} flex flex-row justify-between items-center gap-3`}
      >
        <div className="flex items-center gap-2 font-bold text-foreground bg-card/80 p-1 rounded-xl shadow-sm border border-border/50 min-w-0">
          <Stethoscope className="w-5 h-5 text-indigo-500 shrink-0" />
          <span className="truncate max-w-[140px] text-sm">{pedido.doctor}</span>
        </div>
        <div className="shrink-0">
          <BotonTransferirPedido
            idEstudio={pedido.idEstudio}
            estado={estado}
            procesando={procesando}
            onTransferir={onTransferir}
          />
        </div>
      </div>
    </div>
  );
};