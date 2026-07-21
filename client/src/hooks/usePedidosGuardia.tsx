import { GuardiaService } from "@/services/guardia.service";
import type { IPacienteGuardia } from "@/types/pacientes";
import type { IDetallePedidoGuardia, IPedidoGuardia } from "@/types/pedidos";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export const useServicioGuardia = () => {
  const [pedidosGuardia, setPedidosGuardia] = useState<IPedidoGuardia[]>([]);
  const [pedidosPaciente, setPedidosPaciente] = useState<
    IDetallePedidoGuardia[]
  >([]);
  const [pacienteGuardia, setPacienteGuardia] =
    useState<IPacienteGuardia | null>(null);

  const [loadingGuardia, setLoadingGuardia] = useState(false);
  const [refreshingGuardia, setRefreshingGuardia] = useState(false);
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [loadingPedidosPaciente, setLoadingPedidosPaciente] = useState(false);
  const [lugaresGuardia, setLugaresGuardia] = useState<string[]>([]);
  const pedidosRef = useRef<IPedidoGuardia[]>([]);

  /* ================== PEDIDOS GUARDIA ================== */
  const traerPedidosGuardia = useCallback(
    async (silent = false, fecha?: string, showFeedback = false) => {
      if (!silent) setLoadingGuardia(true);
      else setRefreshingGuardia(true);

      const inicio = Date.now();
      const promise = GuardiaService.getPedidos(fecha);

      try {
        const data = await promise;

        if (showFeedback) {
          const idsViejos = new Set(pedidosRef.current.map((p) => p.idEstudio));
          const nuevos = data.filter((p) => !idsViejos.has(p.idEstudio));
          if (nuevos.length > 0) {
            toast.success(
              `${nuevos.length} pedido${nuevos.length > 1 ? "s" : ""} nuevo${nuevos.length > 1 ? "s" : ""}`,
            );
          } else {
            toast.info("No hay nuevos pedidos");
          }
        }

        setPedidosGuardia(data);
        pedidosRef.current = data;
        setLugaresGuardia([
          ...new Set(
            data.map((p) => p.ubicacion.split("-")[0] || p.ubicacion.trim()),
          ),
        ]);
      } catch (e) {
        toast.error(`Error: ${getErrorMessage(e)}`);
      } finally {
        setLoadingGuardia(false);
        const restante = Math.max(0, 800 - (Date.now() - inicio));
        if (restante > 0) {
          setTimeout(() => setRefreshingGuardia(false), restante);
        } else {
          setRefreshingGuardia(false);
        }
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
    } catch {
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
      console.error(`Error al cargar pedidos: ${getErrorMessage(e)}`);
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
        id: "pedidos-guardia",
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

  const transferirPedido = useCallback(
    async (idEstudio: string) => {
      const promise = GuardiaService.transferirPedido(idEstudio);

      toast.promise(promise, {
        id: "transferir-guardia",
        loading: "Transfiriendo pedido...",
        success: "Pedido transferido",
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
    lugaresGuardia,

    loadingGuardia,
    refreshingGuardia,
    loadingPaciente,
    loadingPedidosPaciente,

    traerPedidosGuardia,
    buscarPacienteGuardia,
    buscarPedidosPaciente,
    finalizarEstudio,
    transferirPedido,
  };
};
