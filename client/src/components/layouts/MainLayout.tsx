import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 1. Header Fijo */}
      <Navbar />

      {/* 2. Contenido Dinámico (Las páginas) */}
      {/* flex-1 hace que este div ocupe todo el espacio disponible, empujando el footer abajo */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Footer Fijo abajo */}
    </div>
  );
}
