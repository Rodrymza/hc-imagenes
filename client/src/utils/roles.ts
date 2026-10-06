const ROL_BADGE_CLASSES: Record<string, string> = {
  ADMIN: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  USER: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  MAMO: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  MEDICO:
    "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300",
};

export const rolBadgeClass = (rol: string): string =>
  ROL_BADGE_CLASSES[rol] ??
  "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";