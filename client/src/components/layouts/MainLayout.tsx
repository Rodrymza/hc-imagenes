import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* 1. Header Fijo */}
      <Navbar />

      {/* 2. Contenido Dinámico (Las páginas) */}
      {/* flex-1 hace que este div ocupe todo el espacio disponible, empujando el footer abajo */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Footer Fijo abajo */}
      <Footer />
    </div>
  );
}
