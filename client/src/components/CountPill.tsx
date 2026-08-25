export type TipoEstudio = "Total" | "Filtrados" | "Radiografia" | "Tomografia" | "Ecografia" | "Otro";

interface Props {
  tipo: TipoEstudio;
  valor: number;
}

const etiquetas: Record<TipoEstudio, string> = {
  Total: "Total",
  Filtrados: "Filtrados",
  Radiografia: "Rx",
  Tomografia: "Tomo",
  Ecografia: "Eco",
  Otro: "Otro",
};

const colores: Record<TipoEstudio, string> = {
  Total: "bg-white/20",
  Filtrados: "bg-white/30",
  Radiografia: "bg-red-600",
  Tomografia: "bg-blue-600",
  Ecografia: "bg-purple-600",
  Otro: "bg-gray-600",
};

const CountPill = ({ tipo, valor }: Props) => {
  return (
    <span
      className={`${colores[tipo]} uppercase text-sm font-bold text-white px-2 py-1 rounded-xl`}
    >
      {etiquetas[tipo]}: {valor}
    </span>
  );
};

export default CountPill;
