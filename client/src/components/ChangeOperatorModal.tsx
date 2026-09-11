import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { X, ArrowRightLeft } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangeOperatorModal({ open, onClose }: Props) {
  const { changeOperator, activeOperator, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    try {
      const newOperator = await changeOperator(pin);
      toast.success(
        `Operador cambiado a ${newOperator.apellido}, ${newOperator.nombre}`,
      );
      setPin("");
      onClose();

      const perdiendoAdmin =
        user?.rol === "ADMIN" &&
        user.id !== newOperator.id &&
        location.pathname.startsWith("/admin");
      if (perdiendoAdmin) {
        navigate("/internacion");
      }
    } catch (error) {
      const msg = getErrorMessage(error) || "PIN inválido";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    setPin("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-black text-foreground">
              Cambiar Operador
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeOperator && (
          <div className="px-6 pt-4 pb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Operador actual
            </p>
            <p className="text-sm font-bold text-foreground">
              {activeOperator.apellido}, {activeOperator.nombre}
            </p>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-foreground/90 mb-1">
              PIN del nuevo operador
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              autoComplete="off"
              autoFocus
              required
              className="w-full px-4 py-3 border border-input bg-transparent rounded-lg text-center text-2xl tracking-[0.5em] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="----"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
                if (val.length === 4) {
                  setTimeout(() => {
                    formRef.current?.requestSubmit();
                  }, 0);
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
