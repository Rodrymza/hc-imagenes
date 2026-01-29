import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  RefreshCw,
  Stethoscope,
  ClipboardList,
  Siren,
  Search,
  Receipt,
  Users,
  Scan,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getIniciales = () => {
    if (!user) return "U";
    return `${user.nombre?.[0] || ""}${user.apellido?.[0] || ""}`.toUpperCase();
  };

  const handleReload = () => window.location.reload();

  // Estilos para los links activos
  const linkClass = (path: string) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all
    ${
      location.pathname === path
        ? "bg-emerald-100 text-emerald-800 shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }
  `;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-[1800px] mx-auto flex h-16 items-center justify-between px-6 gap-4">
        {/* 1. LOGO */}
        <Link to="/" className="flex items-center gap-2 min-w-fit group">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md group-hover:bg-emerald-700 transition-colors">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-emerald-950 text-sm md:text-base leading-none tracking-tight uppercase">
              Hospital Central
            </span>
            <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">
              Área de Imágenes
            </span>
          </div>
        </Link>

        {/* 2. MENÚ DE NAVEGACIÓN (Centro) */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/internacion" className={linkClass("/internacion")}>
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            Internación
          </Link>

          <Link to="/guardia" className={linkClass("/guardia")}>
            <Siren className="h-4 w-4 text-red-600" />
            Guardia
          </Link>

          <Link to="/buscar-paciente" className={linkClass("/buscar-paciente")}>
            <Search className="h-4 w-4 text-amber-500" />
            Buscar
          </Link>

          <Link to="/consumos" className={linkClass("/consumos")}>
            <Receipt className="h-4 w-4 text-emerald-600" />
            Consumos
          </Link>

          <Link
            to="/pacientes-internacion"
            className={linkClass("/pacientes-internacion")}
          >
            <Users className="h-4 w-4 text-slate-500" />
            Pacientes
          </Link>

          <a
            href="http://10.101.0.46/viewer/index.php"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-all"
          >
            <Scan className="h-4 w-4 text-sky-500" />
            Visualizador
          </a>
        </nav>

        {/* 3. ACCIONES Y USUARIO (Derecha) */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReload}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all hidden sm:flex"
            title="Recargar página"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          {/* PERFIL DE USUARIO (Manual Dropdown) */}
          <div className="flex items-center gap-4">
            {/* LÓGICA DE CARGA / PERFIL */}
            <div className="relative pl-4 border-l border-slate-200">
              {isLoading ? (
                /* --- 1. ESTADO CARGANDO (Skeleton) --- */
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <div className="h-3 w-24 bg-slate-200 rounded-full" />
                    <div className="h-2 w-16 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                </div>
              ) : user ? (
                /* --- 2. ESTADO CON USUARIO (Tu código original) --- */
                <>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="hidden md:flex flex-col items-end mr-1">
                      <span className="text-sm font-black text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">
                        {user.apellido}, {user.nombre}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        {user.rol || "Técnico"}
                      </span>
                    </div>

                    <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white ring-2 ring-emerald-50">
                      {getIniciales()}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* DROPDOWN MENU MANUAL */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Sesión de
                          </p>
                          <p className="text-sm font-black text-slate-800 truncate">
                            {user.username}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* --- 3. ESTADO FALLIDO (Opcional: Si no hay usuario tras cargar) --- */
                <Link
                  to="/login"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
