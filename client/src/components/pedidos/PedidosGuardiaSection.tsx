import { ClipboardList, Loader2, Zap } from "lucide-react";
import type { IDetallePedidoGuardia } from "@/types/pedidos";
import { PedidoGuardiaCard } from "./PedidoGuardiaCard";

interface PedidosGuardiaSectionProps {
  pedidos: IDetallePedidoGuardia[];
  loading: boolean;
}

export function PedidosGuardiaSection({
  pedidos,
  loading,
}: PedidosGuardiaSectionProps) {
  return (
    <div className="max-w-7xl mx-auto mt-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border-2 border-amber-100 shadow-md overflow-hidden">
        <div className="bg-teal-700 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-wider leading-none">
                Pedidos de Guardia Activos
              </h3>
              <p className="text-amber-100 text-[10px] font-bold uppercase mt-1">
                Detección automática de órdenes médicas
              </p>
            </div>
          </div>

          {loading && <Loader2 className="w-5 h-5 text-white animate-spin" />}
        </div>

        <div className="p-4 bg-amber-50/30 min-h-[150px] flex flex-col justify-center">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 bg-white border border-slate-100 animate-pulse flex items-center gap-4"
                >
                  <div className="flex flex-col items-center gap-1.5 py-2 px-3 min-w-[60px]">
                    <div className="h-3 w-3 bg-slate-200 rounded" />
                    <div className="h-2.5 w-10 bg-slate-200 rounded" />
                    <div className="h-2.5 w-8 bg-slate-200 rounded" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                    <div className="h-5 bg-slate-200 rounded-full w-16 mt-1" />
                  </div>
                  <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : pedidos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
              {[...pedidos]
                .sort((a, b) => {
                  if (a.realizado !== b.realizado)
                    return a.realizado ? 1 : -1;
                  return 0;
                })
                .map((pedido) => (
                  <PedidoGuardiaCard key={pedido.idEstudio} pedido={pedido} />
                ))}
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400 opacity-60">
              <ClipboardList className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm font-medium">
                El paciente no registra pedidos de guardia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
