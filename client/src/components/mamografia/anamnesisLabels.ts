import type { IEstudioConHallazgos } from "@/types/mamografia";

export const ANAMNESIS_LABELS: {
  key: keyof IEstudioConHallazgos;
  label: string;
}[] = [
  { key: "motivo_consulta", label: "Motivo de consulta" },
  { key: "menarca", label: "Menarca" },
  { key: "fecha_ultima_menstruacion", label: "Última menstruación" },
  { key: "edad_primer_hijo", label: "Edad primer hijo" },
  { key: "cantidad_hijos", label: "Cantidad de hijos" },
  { key: "lactancia", label: "Lactancia" },
  { key: "terapia_reemplazo_hormonal", label: "Terapia de reemplazo hormonal" },
  { key: "anticonceptivos_orales", label: "Anticonceptivos orales" },
  {
    key: "antecedentes_quirurgicos_mamarios",
    label: "Antecedentes quirúrgicos mamarios",
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