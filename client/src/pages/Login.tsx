import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Stethoscope, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/utils/getErrorMessage";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await login({
        username,
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
      navigate("/internacion");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #198754, #0d6efd)" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="pt-8 pb-6 px-8 flex flex-col items-center">
          <div className="bg-emerald-50 p-3 rounded-full mb-4 shadow-sm">
            <Stethoscope className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            HC Imágenes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa tus credenciales
          </p>
        </div>

        <form onSubmit={handleLogin} className="px-8 pb-8 space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="block text-sm font-bold text-slate-700"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              autoFocus
              placeholder="ej. rramirez"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700"
              >
                Contraseña
              </label>
            </div>
            <PasswordInput
              id="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="totpCode"
              className="block text-sm font-bold text-slate-700"
            >
              Código Authenticator HSI
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="totpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all tracking-[0.5em] text-center font-mono text-lg"
              value={totpCode}
              onChange={(e) =>
                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-400">
              Ingresá el código de 6 dígitos para activar la sesión de HSI
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="bg-slate-50 py-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 Sistema de Gestión Hospitalaria
          </p>
        </div>
      </div>
    </div>
  );
}
