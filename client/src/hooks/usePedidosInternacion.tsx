import { InternacionService } from "@/services/internacion.service";
import type { IEnvioComentario, IPedidoInternacion } from "@/types/pedidos";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export const usePedidosInternacion = () => {
  const [pedidosInternacion, setPedidosInternacion] = useState<
    IPedidoInternacion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingInternacion, setRefreshingInternacion] = useState(false);
  const [lugares, setLugares] = useState<string[]>([]);
  const pedidosRef = useRef<IPedidoInternacion[]>([]);

  const traerPedidosInternacion = useCallback(
    async (silenRefresh: boolean = false, fecha?: string, showFeedback = false) => {
      if (!silenRefresh) {
        setIsLoading(true);
      } else {
        setRefreshingInternacion(true);
      }

      const inicio = Date.now();

      const fetchData = async () => {
        const pedidosApi = await InternacionService.getPedidos(fecha);

        if (showFeedback) {
          const idsViejos = new Set(pedidosRef.current.map((p) => p.idEstudio));
          const nuevos = pedidosApi.filter((p) => !idsViejos.has(p.idEstudio));
          if (nuevos.length > 0) {
            toast.success(`${nuevos.length} pedido${nuevos.length > 1 ? "s" : ""} nuevo${nuevos.length > 1 ? "s" : ""}`);
          } else {
            toast.info("No hay nuevos pedidos");
          }
        }

        setPedidosInternacion(pedidosApi);
        pedidosRef.current = pedidosApi;
        setLugares([
          ...new Set(pedidosApi.map((p) => p.lugar.trim()).filter(Boolean)),
        ]);
        return pedidosApi;
      };

      const traerDatosPromise = fetchData();

      try {
        await traerDatosPromise;
      } catch (err) {
        toast.error(`No se pudo cargar: ${getErrorMessage(err)}`);
      } finally {
        setIsLoading(false);
        const restante = Math.max(0, 800 - (Date.now() - inicio));
        if (restante > 0) {
          setTimeout(() => setRefreshingInternacion(false), restante);
        } else {
          setRefreshingInternacion(false);
        }
      }
    },
    [],
  );

  const alternarEstadoPedido = useCallback(
    async (item: IPedidoInternacion) => {
      // A. Calculamos el nuevo estado (Lógica de negocio)
      const estaRealizado =
        item.comentario?.toLowerCase().includes("realiz") ||
        item.comentario?.toLowerCase().includes("ok");

      const nuevoComentario = estaRealizado ? "PENDIENTE" : "REALIZADO";

      // B. Guardamos el estado anterior por si hay que revertir (Rollback)
      const copiaAnterior = [...pedidosInternacion];

      // C. Actualización Optimista: Cambiamos la UI al instante
      setPedidosInternacion((prev) =>
        prev.map((p) =>
          p.idEstudio === item.idEstudio
            ? { ...p, comentario: nuevoComentario }
            : p,
        ),
      );

      // D. Preparamos el objeto para el Service
      const datosEnvio: IEnvioComentario = {
        idEstudio: item.idEstudio,
        idMovimiento: item.idMovimiento,
        comentario: nuevoComentario,
        nota: item.nota || "",
      };
      console.log("Datos a enviar", datosEnvio);

      // E. Llamada al Service con Toast
      toast.promise(InternacionService.enviarComentario(datosEnvio), {
        loading: "Guardando cambio...",
        success: (data) => data.message || "Estado actualizado en el servidor",
        error: (err) => {
          // ERROR: Revertimos al estado anterior si falla la API
          setPedidosInternacion(copiaAnterior);
          return `Error al guardar: ${getErrorMessage(err)}`;
        },
      });
    },
    [pedidosInternacion],
  ); // Necesitamos pedidosInternacion para la copia de seguridad

  const guardarNota = useCallback(
    async (item: IPedidoInternacion, nuevaNota: string) => {
      const copiaAnterior = [...pedidosInternacion];

      setPedidosInternacion((prev) =>
        prev.map((p) =>
          p.idEstudio === item.idEstudio ? { ...p, nota: nuevaNota } : p,
        ),
      );

      const datosEnvio: IEnvioComentario = {
        idEstudio: item.idEstudio,
        idMovimiento: item.idMovimiento,
        comentario: item.comentario,
        nota: nuevaNota,
      };

      toast.promise(InternacionService.enviarComentario(datosEnvio), {
        loading: "Guardando nota...",
        success: (data) => data.message || "Nota guardada en el servidor",
        error: (err) => {
          setPedidosInternacion(copiaAnterior);
          return `Error al guardar: ${getErrorMessage(err)}`;
        },
      });
    },
    [pedidosInternacion],
  );

  return {
    pedidosInternacion,
    isLoading,
    refreshingInternacion,
    lugares,
    traerPedidosInternacion,
    alternarEstadoPedido,
    guardarNota,
  };
};
