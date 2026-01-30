import { GuardiaService } from "@/services/guardia.service";
import type { IPacienteGuardia } from "@/types/pacientes";
import type { IDetallePedidoGuardia, IPedidoGuardia } from "@/types/pedidos";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useServicioGuardia = () => {
  const [pedidosGuardia, setPedidosGuardia] = useState<IPedidoGuardia[]>([]);
  const [pedidosPaciente, setPedidosPaciente] = useState<
    IDetallePedidoGuardia[]
  >([]);
  const [pacienteGuardia, setPacienteGuardia] =
    useState<IPacienteGuardia | null>(null);

  const [loadingGuardia, setLoadingGuardia] = useState(false);
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [loadingPedidosPaciente, setLoadingPedidosPaciente] = useState(false);

  /* ================== PEDIDOS GUARDIA ================== */
  const traerPedidosGuardia = useCallback(
    async (silent = false, fecha?: string) => {
      if (!silent) setLoadingGuardia(true);

      const promise = GuardiaService.getPedidos(fecha);

      toast.promise(promise, {
        id: "pedidos-guardia",
        loading: "Actualizando pedidos Guardia...",
        success: (data) => `Se cargaron ${data.length} pedidos`,
        error: (e) => `Error: ${getErrorMessage(e)}`,
      });

      try {
        const data = await promise;
        setPedidosGuardia(data);
      } finally {
        setLoadingGuardia(false);
      }
    },
    [],
  );

  /* ================== PACIENTE ================== */
  const buscarPacienteGuardia = useCallback(async (dni: string) => {
    if (!dni) return;

    setPacienteGuardia(null);
    setLoadingPaciente(true);

    try {
      const paciente = await GuardiaService.buscarPacienteGuardia(dni);
      setPacienteGuardia(paciente ?? null);
    } catch (e) {
      toast.error("Paciente no encontrado en Guardia");
    } finally {
      setLoadingPaciente(false);
    }
  }, []);

  /* ================== PEDIDOS DEL PACIENTE ================== */
  const buscarPedidosPaciente = useCallback(async (dni: string) => {
    if (!dni) return;

    setPedidosPaciente([]);
    setLoadingPedidosPaciente(true);

    try {
      const pedidos = await GuardiaService.getPedidosPaciente(dni);
      setPedidosPaciente(pedidos);
    } catch (e) {
      toast.error(`Error al cargar pedidos: ${getErrorMessage(e)}`);
    } finally {
      setLoadingPedidosPaciente(false);
    }
  }, []);

  /* ================== FINALIZAR ================== */
  const marcarFinalizado = useCallback((idEstudio: string) => {
    setPedidosPaciente((prev) =>
      prev.map((p) =>
        p.idEstudio === idEstudio ? { ...p, realizado: true } : p,
      ),
    );
  }, []);

  const finalizarEstudio = useCallback(
    async (idEstudio: string, dniPaciente: string) => {
      const promise = GuardiaService.finalizarPedidoPorDni(
        idEstudio,
        dniPaciente,
      );

      toast.promise(promise, {
        loading: "Finalizando pedido...",
        success: "Pedido finalizado",
        error: (e) => `Error: ${getErrorMessage(e)}`,
      });

      await promise;
      marcarFinalizado(idEstudio);
      traerPedidosGuardia(true);
    },
    [marcarFinalizado, traerPedidosGuardia],
  );

  return {
    pedidosGuardia,
    pedidosPaciente,
    pacienteGuardia,

    loadingGuardia,
    loadingPaciente,
    loadingPedidosPaciente,

    traerPedidosGuardia,
    buscarPacienteGuardia,
    buscarPedidosPaciente,
    finalizarEstudio,
  };
};
