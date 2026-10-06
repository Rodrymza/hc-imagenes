import { useCallback, useEffect, useState } from "react";
import { InternoService } from "@/services/interno.service";

export type OrigenConsumo = "GUARDIA" | "INTERNACION" | "AMBULATORIO";

export const useEstudiosConsumo = (
  ids: string[],
  origen: OrigenConsumo,
  opciones?: { persistir?: boolean },
) => {
  const persistir = opciones?.persistir ?? true;
  const [idEstudiosEnviados, setIdEstudiosEnviados] = useState<Set<string>>(
    new Set(),
  );
  const claveIds = ids.join(",");

  useEffect(() => {
    if (!persistir) return;
    if (!claveIds) return;
    let activo = true;
    InternoService.getEstudiosConsumo(claveIds.split(","))
      .then((enviados) => {
        if (activo) setIdEstudiosEnviados(new Set(enviados));
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [persistir, claveIds]);

  const marcarEnviados = useCallback(
    async (nuevosIds: string[]) => {
      if (nuevosIds.length === 0) return;
      try {
        if (persistir) {
          await InternoService.marcarEstudiosConsumo(nuevosIds, origen);
        }
        setIdEstudiosEnviados((prev) => new Set([...prev, ...nuevosIds]));
      } catch (error) {
        console.error(error);
      }
    },
    [persistir, origen],
  );

  return { idEstudiosEnviados, marcarEnviados };
};