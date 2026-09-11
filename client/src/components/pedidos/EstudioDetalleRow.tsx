import type { IDetallePedidoGuardia } from "@/types/pedidos";
import { CalendarClock, Stethoscope } from "lucide-react";
import { getEstiloEstudio } from "./utils";
import { BotonTransferirPedido } from "./BotonTransferirPedido";
import type { EstadoPedido } from "@/utils/pedidos";

interface EstudioDetalleRowProps {
  pedido: IDetallePedidoGuardia;
  estado: EstadoPedido;
  procesando: boolean;
  onTransferir: (idEstudio: string) => void;
}

export const EstudioDetalleRow = ({
  pedido,
  estado,
  procesando,
  onTransferir,
}: EstudioDetalleRowProps) => {
  const estilo = getEstiloEstudio(pedido.tipoEstudio);
  const [dia, hora] = pedido.fecha.split(" ");
  const filaApagada = estado !== "activo" ? "opacity-60 grayscale" : "";

  return (
    <tr
      className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${filaApagada}`}
    >
      {/* FECHA */}
      <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
        <div className="flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm whitespace-nowrap">
              {dia || "--"}
            </span>
            {hora && (
              <span className="text-xs text-slate-400 font-mono">{hora}</span>
            )}
          </div>
        </div>
      </td>

      {/* TIPO / PRÁCTICA */}
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col items-center gap-1.5">
          <span
            className={`inline-block w-fit px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${estilo.badge}`}
          >
            {pedido.tipoEstudio}
          </span>
          <span className="font-semibold text-foreground text-sm leading-snug text-center whitespace-normal break-words">
            {pedido.pedido}
          </span>
        </div>
      </td>

      {/* DIAGNÓSTICO / SOLICITANTE */}
      <td className="px-4 py-4 max-w-[280px] align-middle">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-foreground/80 whitespace-normal break-words">
            {pedido.diagnostico || "Sin diagnóstico"}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Stethoscope className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">{pedido.doctor}</span>
          </span>
        </div>
      </td>

      {/* ACCIÓN */}
      <td className="px-4 py-4 whitespace-nowrap text-right align-middle">
        <div className="flex justify-center">
          <BotonTransferirPedido
            idEstudio={pedido.idEstudio}
            estado={estado}
            procesando={procesando}
            onTransferir={onTransferir}
          />
        </div>
      </td>
    </tr>
  );
};