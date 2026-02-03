import { InternacionService } from "@/services/internacion.service";
import type { IEnvioComentario, IPedidoInternacion } from "@/types/pedidos";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const usePedidosInternacion = () => {
  const [pedidosInternacion, setPedidosInternacion] = useState<
    IPedidoInternacion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const traerPedidosInternacion = useCallback(
    async (silenRefresh: boolean = false, fecha?: string) => {
      if (!silenRefresh) {
        setIsLoading(true);
      }

      //await new Promise((resolve) => setTimeout(resolve, 3000));
      // 1. Definimos la función de carga
      const fetchData = async () => {
        const pedidosApi = await InternacionService.getPedidos(fecha);
        setPedidosInternacion(pedidosApi);
        return pedidosApi;
      };

      const traerDatosPromise = fetchData();

      toast.promise(traerDatosPromise, {
        id: "carga-pedidos", // ID único para evitar duplicados visuales
        success: (data) => `Se cargaron ${data.length} pedidos de Internacion`,
        error: (err) => `No se pudo cargar: ${getErrorMessage(err)}`,
      });

      try {
        await traerDatosPromise;
      } catch (err) {
        console.error("Error en la carga:", err);
      } finally {
        setIsLoading(false);
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

  return {
    pedidosInternacion,
    isLoading,
    traerPedidosInternacion,
    alternarEstadoPedido,
  };
};
