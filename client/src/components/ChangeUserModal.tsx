import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import PasswordInput from "@/components/PasswordInput";
import { X, UserRoundCog, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangeUserModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setUsername("");
    setPassword("");
    setTotpCode("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsSubmitting(true);
    try {
      const res = await login({
        username: username.trim(),
        password,
        totpCode: totpCode || undefined,
      });
      if (res.hsiLogin) {
        toast.success("¡Bienvenido! Sesión HSI activa.");
      } else if (totpCode) {
        toast.warning("Login exitoso, pero falló la conexión a HSI.");
      } else {
        toast.success("¡Bienvenido al sistema!");
      }
      reset();
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Error al cambiar de usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserRoundCog className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-black text-foreground">
              Cambiar Usuario
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground/90 mb-1">
              Usuario
            </label>
            <input
              type="text"
              required
              autoFocus
              autoComplete="username"
              placeholder="ej. rramirez"
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground/90 mb-1">
              Contraseña
            </label>
            <PasswordInput
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground/90 mb-1">
              Código Authenticator HSI
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all tracking-[0.5em] text-center font-mono text-lg"
              value={totpCode}
              onChange={(e) =>
                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Ingresá el código de 6 dígitos para activar la sesión de HSI
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Cambiando...
              </>
            ) : (
              "Cambiar Usuario"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}