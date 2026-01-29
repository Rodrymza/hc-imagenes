import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Si todavía estamos comprobando la cookie/sesión, mostramos un spinner
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

  // 2. Si terminó de cargar y NO está autenticado, lo mandamos al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si está autenticado, dejamos pasar y renderizamos la página hija (Outlet)
  return <Outlet />;
};
