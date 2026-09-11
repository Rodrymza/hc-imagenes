import {
  Layers,
  Activity,
  Image,
  Bed,
  Brain,
  Radiation,
  Check,
  Clock,
} from "lucide-react";
import type { JSX } from "react";

export interface EstiloEstudio {
  bg: string;
  border: string;
  text: string;
  badge: string;
  icon: JSX.Element;
}

export const getEstiloEstudio = (tipo: string = ""): EstiloEstudio => {
  const t = tipo.toLowerCase();

  if (t.includes("tomo") || t.includes("tc")) {
    return {
      bg: "bg-blue-200 dark:bg-blue-950/70",
      border: "border-blue-400 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-300",
      badge:
        "border bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
      icon: <Layers className="w-5 h-5" />,
    };
  }

  if (t.includes("eco") || t.includes("doppler")) {
    return {
      bg: "bg-purple-200 dark:bg-purple-950/70",
      border: "border-purple-400 dark:border-purple-800",
      text: "text-purple-800 dark:text-purple-300",
      badge:
        "border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
      icon: <Activity className="w-5 h-5" />,
    };
  }

  // Default (Radiografía / Otros)
  return {
    bg: "bg-red-200 dark:bg-red-950/70",
    border: "border-red-400 dark:border-red-800",
    text: "text-red-800 dark:text-red-300",
    badge:
      "border bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    icon: <Image className="w-5 h-5" />,
  };
};

export const getLugarEstilo = (lugar: string) => {
  const l = lugar.toLowerCase();
  if (l.includes("cama"))
    return {
      bg: "bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800",
      icon: <Bed className="w-4 h-4 mr-2" />,
    };
  if (l.includes("tomó") || l.includes("tc"))
    return {
      bg: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
      icon: <Brain className="w-4 h-4 mr-2" />,
    };
  return {
    bg: "bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800",
    icon: <Radiation className="w-4 h-4 mr-2" />,
  };
};

export interface EstiloEstado {
  badge: string;
  hover: string;
  icon: JSX.Element;
  label: string;
}

export const getEstadoEstilo = (realizado: boolean): EstiloEstado =>
  realizado
    ? {
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
        hover:
          "hover:bg-emerald-100 hover:border-emerald-400 dark:hover:bg-emerald-900/60 dark:hover:border-emerald-600",
        icon: <Check className="w-4 h-4" strokeWidth={2.5} />,
        label: "Realizado",
      }
    : {
        badge:
          "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
        hover:
          "hover:bg-orange-100 hover:border-orange-400 dark:hover:bg-orange-900/50 dark:hover:border-orange-600",
        icon: <Clock className="w-4 h-4" strokeWidth={2.5} />,
        label: "Pendiente",
      };

export function capitalize(text?: string): string {
  if (!text || typeof text !== "string") return "";

  let nuevoTexto = "";
  for (let i = 0; i < text.length; i++) {
    if (i === 0 || text[i - 1] === " ") {
      nuevoTexto += text[i].toUpperCase();
    } else {
      nuevoTexto += text[i].toLowerCase();
    }
  }
  return nuevoTexto;
}
