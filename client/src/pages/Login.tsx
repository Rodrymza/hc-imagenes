import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Stethoscope, Loader2 } from "lucide-react"; // Usamos iconos directos

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ username, password });
      toast.success("¡Bienvenido al sistema!");
      navigate("/internacion"); // Redirige a la página principal
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // CONTENEDOR PRINCIPAL CON EL GRADIENTE SOLICITADO
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #198754, #0d6efd)" }}
    >
      {/* TARJETA BLANCA (Login Box) */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Encabezado del Login */}
        <div className="pt-8 pb-6 px-8 flex flex-col items-center">
          {/* Logo / Icono */}
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

        {/* Formulario */}
        <form onSubmit={handleLogin} className="px-8 pb-8 space-y-5">
          {/* Input Usuario */}
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

          {/* Input Contraseña */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700"
              >
                Contraseña
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Botón de Acción */}
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

        {/* Footer pequeño (Copyright) */}
        <div className="bg-slate-50 py-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 Sistema de Gestión Hospitalaria
          </p>
        </div>
      </div>
    </div>
  );
}
