import { CheckCircle2, Loader2 } from "lucide-react";
import type { EstadoPedido } from "@/utils/pedidos";

interface BotonTransferirPedidoProps {
  idEstudio: string;
  estado: EstadoPedido;
  procesando: boolean;
  onTransferir: (idEstudio: string) => void;
}

const baseClase =
  "flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all w-full sm:w-auto";

export const BotonTransferirPedido = ({
  idEstudio,
  estado,
  procesando,
  onTransferir,
}: BotonTransferirPedidoProps) => {
  if (estado === "activo") {
    return (
      <button
        onClick={() => onTransferir(idEstudio)}
        disabled={procesando}
        className={`${baseClase} bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {procesando ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-5 h-5" />
        )}
        {procesando ? "Procesando..." : "Transferir"}
      </button>
    );
  }

  if (estado === "realizado") {
    return (
      <span
        className={`${baseClase} bg-muted text-muted-foreground border-none cursor-not-allowed`}
      >
        Transferido
      </span>
    );
  }

  return (
    <span
      className={`${baseClase} bg-muted text-muted-foreground border-none cursor-not-allowed`}
    >
      &gt; 2 días
    </span>
  );
};