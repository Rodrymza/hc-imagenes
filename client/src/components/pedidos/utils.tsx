import {
  Layers,
  Activity,
  Image,
  Bed,
  Brain,
  Hospital,
  Radiation,
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
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      badge: "bg-blue-600 text-white",
      icon: <Layers className="w-5 h-5" />,
    };
  }

  if (t.includes("eco") || t.includes("doppler")) {
    return {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      badge: "bg-purple-600 text-white",
      icon: <Activity className="w-5 h-5" />,
    };
  }

  // Default (Radiografía / Otros)
  return {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-600 text-white",
    icon: <Image className="w-5 h-5" />,
  };
};

export const getLugarEstilo = (lugar: string) => {
  const l = lugar.toLowerCase();
  if (l.includes("cama"))
    return {
      bg: "bg-amber-100 text-amber-900 border-amber-300",
      icon: <Bed className="w-5 h-5 mr-2" />,
    };
  if (l.includes("tomó") || l.includes("tc"))
    return {
      bg: "bg-blue-50 text-blue-800 border-blue-200",
      icon: <Brain className="w-5 h-5 mr-2" />,
    };
  return {
    bg: "bg-lime-200 text-green-800 border-lime-400",
    icon: <Radiation className="w-5 h-5 mr-2 text-black fill-yellow-400" />,
  };
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
