export function Footer() {
  return (
    <footer className="border-t bg-white/50 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row px-4">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Sistema de Gestión Hospitalaria.
          <span className="hidden md:inline"> | Departamento de Imágenes.</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-500">
            Sistema Operativo
          </span>
        </div>
      </div>
    </footer>
  );
}
