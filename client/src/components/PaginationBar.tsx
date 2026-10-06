import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  variant?: "dark" | "light" | "rose";
}

export default function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  variant = "dark",
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const buttonClasses =
    variant === "rose"
      ? "bg-white text-rose-700 border border-rose-300 shadow-sm"
      : variant === "light"
        ? "bg-white text-emerald-700 border border-emerald-200 shadow-sm"
        : "bg-white/20 text-white";
  const pageClasses =
    variant === "rose"
      ? "text-rose-700"
      : variant === "light"
        ? "text-emerald-900"
        : "text-white";
  const summaryClasses =
    variant === "rose"
      ? "text-muted-foreground"
      : variant === "light"
        ? "text-muted-foreground"
        : "text-white/60";
  const hoverClasses = variant === "rose" ? "hover:bg-rose-50" : "hover:bg-emerald-50";

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${hoverClasses} disabled:opacity-40 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <span className={`font-black text-sm ${pageClasses}`}>
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${hoverClasses} disabled:opacity-40 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <span className={`text-xs font-medium ${summaryClasses}`}>
        Mostrando {start}-{end} de {totalItems}
      </span>
    </div>
  );
}
