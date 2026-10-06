import type { IAnamnesis } from "@/types/mamografia";

interface Props {
  value: IAnamnesis;
  onChange: (anamnesis: IAnamnesis) => void;
}

const CAMPOS: { key: keyof IAnamnesis; label: string; placeholder?: string }[] =
  [
    { key: "motivo_consulta", label: "Motivo de consulta" },
    { key: "menarca", label: "Menarca (años)" },
    {
      key: "fecha_ultima_menstruacion",
      label: "Fecha última menstruación",
      placeholder: "DD/MM/AAAA",
    },
    { key: "edad_primer_hijo", label: "Edad primer hijo" },
    { key: "cantidad_hijos", label: "Cantidad de hijos" },
    { key: "lactancia", label: "Lactancia" },
    {
      key: "terapia_reemplazo_hormonal",
      label: "Terapia de reemplazo hormonal",
    },
    { key: "anticonceptivos_orales", label: "Anticonceptivos orales" },
    {
      key: "antecedentes_quirurgicos_mamarios",
      label: "Antecedentes quirúrgicos mamarios",
      placeholder: "Ej: biopsia, tumorectomía...",
    },
    {
      key: "antecedentes_quirurgicos_generales",
      label: "Antecedentes quirúrgicos generales",
    },
    { key: "antecedentes_oncologicos", label: "Antecedentes oncológicos" },
    { key: "radioterapia", label: "Radioterapia" },
    { key: "quimioterapia", label: "Quimioterapia" },
    {
      key: "antecedentes_heredofamiliares",
      label: "Antecedentes heredofamiliares",
    },
  ];

export function FormAnamnesis({ value, onChange }: Props) {
  const inputClass =
    "w-full px-3 py-2 border border-input bg-transparent rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent";

  const setCampo = (key: keyof IAnamnesis, val: string) => {
    onChange({ ...value, [key]: val || null });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CAMPOS.map((campo) => (
        <div key={campo.key}>
          <label className="block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide">
            {campo.label}
          </label>
          <input
            value={value[campo.key] ?? ""}
            onChange={(e) => setCampo(campo.key, e.target.value)}
            placeholder={campo.placeholder ?? ""}
            className={inputClass}
            type={campo.key == "fecha_ultima_menstruacion" ? "date" : undefined}
          />
        </div>
      ))}
    </div>
  );
}
