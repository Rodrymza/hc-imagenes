import { GuardiaService } from "@/services/guardia.service";
import type { IDetallePedidoGuardia, IPedidoGuardia } from "@/types/pedidos";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useServicioGuardia = () => {
  const [pedidosGuardia, setPedidosGuardia] = useState<IPedidoGuardia[]>([]);
  const [pedidosPaciente, setPedidosPaciente] = useState<
    IDetallePedidoGuardia[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const traerPedidosGuardia = useCallback(async (fecha?: string) => {
    setIsLoading(true);
    const fetchData = async () => {
      const pedidosApi = await GuardiaService.getPedidos(fecha);
      setPedidosGuardia(pedidosApi);
      return pedidosApi;
    };

    const traerDatosPromise = fetchData();

    toast.promise(traerDatosPromise, {
      id: "pedidos-guardia",
      loading: "Actualizando pedidos Guardia...",
      success: (data) => `Se cargaron ${data.length} pedidos correctamente`,
      error: (error) =>
        `No se pudieron cargar los pedidos de guardia: ${getErrorMessage(error)} `,
    });

    try {
      await traerDatosPromise;
    } catch (error) {
      console.error("Error al cargar pedidos de Guardia", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buscarPedidosPaciente = useCallback(async (dni: string) => {
    setIsLoading(true);

    const fetchData = async () => {
      const pedidosApi = await GuardiaService.getPedidosPaciente(dni);
      setPedidosPaciente(pedidosApi);
      return pedidosApi;
    };

    const traerDatosPromise = fetchData();

    toast.promise(traerDatosPromise, {
      id: "pedidos-paciente-guardia",
      loading: "Cargando pedidos de paciente",
      success: (data) => `Se cargaron ${data.length} pedidos`,
      error: (error) => `Error al cargar los pedidos ${getErrorMessage(error)}`,
    });
    try {
      await traerDatosPromise;
    } catch (error) {
      console.error("No se pudieron cargar los pedidos:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const marcarFinalizado = useCallback((idEstudio: string) => {
    setPedidosPaciente((prev) =>
      prev.map((p) =>
        p.idEstudio === idEstudio ? { ...p, realizado: true } : p,
      ),
    );
  }, []);

  const finalizarEstudio = useCallback(
    async (idEstudio: string, dniPaciente: string) => {
      const postFinalizarPromise = GuardiaService.finalizarPedidoPorDni(
        idEstudio,
        dniPaciente,
      );
      toast.promise(postFinalizarPromise, {
        id: "finalizar-pedido-guardia",
        loading: "Finalizando pedido de Guardia",
        success: (data) => data.message || "Pedido finalizado correctamente",
        error: (error) =>
          `No se pudo finalizar el estudio: ${getErrorMessage(error)}`,
      });

      try {
        await postFinalizarPromise;
        marcarFinalizado(idEstudio);
      } catch (error) {
        console.error("No se pudo finalizar el pedido:", error);
        throw error;
      } finally {
      }
    },
    [marcarFinalizado],
  );

  return {
    pedidosGuardia,
    pedidosPaciente,
    isLoading,
    traerPedidosGuardia,
    buscarPedidosPaciente,
    finalizarEstudio,
    marcarFinalizado,
  };
};
