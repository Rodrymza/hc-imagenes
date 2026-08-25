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
  Menu,
  X,
  UserCog,
  ArrowRightLeft,
  Bell,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import ChangeOperatorModal from "@/components/ChangeOperatorModal";
import ConfigNotificacionesPanel from "@/components/ConfigNotificacionesPanel";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
  const { user, activeOperator, isAdminMode, logout, isLoading } = useAuth();
  const location = useLocation();
  const { theme, cycleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Dropdown perfil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <-- Nuevo estado para móvil
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const getIniciales = () => {
    const op = activeOperator || user;
    if (!op) return "U";
    return `${op.nombre?.[0] || ""}${op.apellido?.[0] || ""}`.toUpperCase();
  };

  const handleReload = () => window.location.reload();

  // Estilos para los links activos (Desktop)
  const linkClass = (path: string) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all
    ${
      location.pathname === path
        ? "bg-emerald-100 text-emerald-800 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-300"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }
  `;

  // Estilos para los links activos
  const mobileLinkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all
    ${
      location.pathname === path
        ? "bg-emerald-100 text-emerald-800 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-300"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }
  `;

  const themeIcon =
    theme === "light" ? (
      <Sun className="h-5 w-5" />
    ) : theme === "dark" ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Monitor className="h-5 w-5" />
    );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-[1800px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-2 min-w-fit group z-20">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md group-hover:bg-emerald-700 transition-colors">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-emerald-950 dark:text-emerald-200 text-sm md:text-base leading-none tracking-tight uppercase">
                Hospital Central
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">
                Área de Imágenes
              </span>
            </div>
          </Link>

          {/* 2. MENÚ DE NAVEGACIÓN (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/internacion" className={linkClass("/internacion")}>
              <ClipboardList className="h-4 w-4 text-emerald-600" /> Internación
            </Link>
            <Link to="/guardia" className={linkClass("/guardia")}>
              <Siren className="h-4 w-4 text-red-600" /> Guardia
            </Link>
            <Link
              to="/buscar-paciente"
              className={linkClass("/buscar-paciente")}
            >
              <Search className="h-4 w-4 text-amber-500" /> Buscar
            </Link>
            <Link to="/consumos" className={linkClass("/consumos")}>
              <Receipt className="h-4 w-4 text-emerald-600" /> Consumos
            </Link>
            <Link
              to="/pacientes-internacion"
              className={linkClass("/pacientes-internacion")}
            >
              <Users className="h-4 w-4 text-slate-500" /> Pacientes
            </Link>
            <a
              href="http://10.101.0.46/viewer/index.php"
              target="_blank"
              rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-700 dark:hover:text-sky-400 transition-all"
              >
                <Scan className="h-4 w-4 text-sky-500" /> Visualizador
              </a>
          </nav>

          {/* 3. ACCIONES Y USUARIO (Derecha) */}
          <div className="flex items-center gap-3 sm:gap-4 z-20">
            {/* TOGGLE TEMA */}
            <button
              onClick={cycleTheme}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-all"
              title={`Tema: ${theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema"}`}
            >
              {themeIcon}
            </button>

            <button
              onClick={handleReload}
              className="p-2 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-accent rounded-full transition-all hidden sm:flex"
              title="Recargar página"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {/* CAMBIAR OPERADOR */}
            {user && (
              <button
                onClick={() => setShowOperatorModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-accent border border-border hover:border-emerald-300 dark:hover:border-emerald-800 rounded-lg transition-all"
                title="Cambiar operador"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Operador</span>
              </button>
            )}

            {/* PERFIL / OPERADOR */}
            <div className="relative pl-3 sm:pl-4 border-l border-border">
              {isLoading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <div className="h-3 w-24 bg-muted rounded-full" />
                    <div className="h-2 w-16 bg-muted/60 rounded-full" />
                  </div>
                  <div className="h-9 w-9 rounded-full bg-muted border-2 border-card shadow-sm" />
                </div>
              ) : user ? (
                <>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 sm:gap-3 group"
                  >
                    <div className="hidden md:flex flex-col items-end mr-1">
                      <span className="text-sm font-black text-foreground leading-none group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {activeOperator
                          ? `${activeOperator.apellido}, ${activeOperator.nombre}`
                          : `${user.apellido}, ${user.nombre}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                        Operador
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white dark:border-card ring-2 ring-emerald-50 dark:ring-accent">
                      {getIniciales()}
                    </div>
                    <ChevronDown
                      className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* DROPDOWN MENU */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-3 w-60 bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-3 bg-muted border-b border-border">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Sesión de
                          </p>
                          <p className="text-sm font-black text-foreground truncate">
                            {user.apellido}, {user.nombre}
                          </p>

                          <p className="text-sm font-black text-muted-foreground uppercase tracking-tighter italic">
                            {user.rol}
                          </p>
                          {activeOperator && activeOperator.id !== user.id && (
                            <p className="text-[11px] text-emerald-600 font-bold mt-1">
                              Operando: {activeOperator.apellido},{" "}
                              {activeOperator.nombre}
                            </p>
                          )}
                        </div>
                        {isAdminMode && (
                          <Link
                            to="/admin/usuarios"
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-accent transition-colors"
                          >
                            <UserCog className="h-4 w-4" /> Administrar Usuarios
                          </Link>
                        )}
                        {isAdminMode && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setShowConfigModal(true);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-accent transition-colors"
                          >
                            <Bell className="h-4 w-4" /> Config. Notificaciones
                          </button>
                        )}
                        <div className="h-px bg-border my-1" />
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* BOTON HAMBURGUESA para mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg ml-1 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 4. MENÚ MÓVIL DESPLEGABLE */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full bg-card border-b border-border shadow-xl py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
            <Link
              to="/internacion"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileLinkClass("/internacion")}
            >
              <ClipboardList className="h-5 w-5 text-emerald-600" /> Internación
            </Link>
            <Link
              to="/guardia"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileLinkClass("/guardia")}
            >
              <Siren className="h-5 w-5 text-red-600" /> Guardia
            </Link>
            <Link
              to="/buscar-paciente"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileLinkClass("/buscar-paciente")}
            >
              <Search className="h-5 w-5 text-amber-500" /> Buscar
            </Link>
            <Link
              to="/consumos"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileLinkClass("/consumos")}
            >
              <Receipt className="h-5 w-5 text-emerald-600" /> Consumos
            </Link>
            <Link
              to="/pacientes-internacion"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileLinkClass("/pacientes-internacion")}
            >
              <Users className="h-5 w-5 text-slate-500" /> Pacientes
            </Link>
            <div className="h-px bg-border my-2" />
            <a
              href="http://10.101.0.46/viewer/index.php"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-muted-foreground hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-700 dark:hover:text-sky-400 transition-all"
            >
              <Scan className="h-5 w-5 text-sky-500" /> Visualizador Externo
            </a>
          </div>
        )}
      </header>

      <ChangeOperatorModal
        open={showOperatorModal}
        onClose={() => setShowOperatorModal(false)}
      />
      <ConfigNotificacionesPanel
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
}
