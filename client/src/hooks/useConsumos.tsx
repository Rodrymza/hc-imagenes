import { useState, useEffect, useCallback } from "react";
import { InternoService } from "@/services/interno.service";
import type {
  IConsumoItem,
  IPacienteInterno,
  IResultadoLoteConsumo,
} from "@/types/interno";
import { toast } from "sonner";
import type {
  IDetallePedidoGuardia,
  IPedidoInternacion,
} from "@/types/pedidos";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { IPacienteGuardia } from "@/types/pacientes";

const REGLAS_DETECCION = [
  { regex: /t[oó]rax|pecho/i, match: "TORAX" },
  { regex: /mu[nñ]eca/i, match: "MUÑECA" },
  { regex: /mano/i, match: "MANO" },
  { regex: /pie/i, match: "PIE" },
  { regex: /cervical/i, match: "CERVICAL" },
  { regex: /lumb[ao]/i, match: "LUMBAR" },
  { regex: /dorsal/i, match: "DORSAL" },
  { regex: /abdomen/i, match: "ABDOM" },
  { regex: /tobillo/i, match: "TOBILLO" },
  { regex: /codo/i, match: "CODO" }, // Ojo aquí, tenías rodilla matcheando codo
  { regex: /f[ée]mur/i, match: "FEMUR" },
  { regex: /pelvis/i, match: "PELVIS" },
  { regex: /antebrazo/i, match: "ANTEBRAZO" },
  { regex: /pierna|tibia/i, match: "TIBIA" },
  { regex: /rodilla/i, match: "RODILLA" },
  { regex: /cama/i, match: "CAMA" },
  { regex: /hombro/i, match: "HOMBRO" },
  { regex: /h[uú]mero/i, match: "HUMERO" },
  { regex: /esc[aá]pula/i, match: "HOMBRO" },
  { regex: /clav[íi]cula/i, match: "HOMBRO" },
  { regex: /cadera/i, match: "CADERA" },
];

export const useConsumos = (
  pedidos: IDetallePedidoGuardia[] | IPedidoInternacion[] | null,
) => {
  const [prestaciones, setPrestaciones] = useState<IConsumoItem[]>([]);
  const [exposiciones, setExposiciones] = useState<IConsumoItem[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [guardandoConsumos, setGuardandoConsumos] = useState(false);
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState(false);
  const [pacienteInterno, setPacienteInterno] =
    useState<IPacienteInterno | null>(null);

  const [autoDeteccionRealizada, setAutoDeteccionRealizada] = useState(false);

  // 1. Cargar Catálogo
  useEffect(() => {
    const cargarPrestaciones = async () => {
      try {
        const data = await InternoService.getPrestaciones();
        setPrestaciones(data);
      } catch (error) {
        console.error(error);
        toast.error(`Error al cargar prestaciones ${getErrorMessage(error)}`);
      } finally {
        setLoadingCatalogo(false);
      }
    };
    cargarPrestaciones();
  }, []);

  //Reset cuando cambian los pedidos
  useEffect(() => {
    setExposiciones([]);
    setAutoDeteccionRealizada(false);
  }, [pedidos]);

  // 2. Lógica de Auto-Detección Corregida
  useEffect(() => {
    // Si no hay datos, no hacemos nada
    if (
      !pedidos ||
      pedidos.length === 0 ||
      prestaciones.length === 0 ||
      autoDeteccionRealizada
    ) {
      return;
    }

    const nuevasDetectadas: IConsumoItem[] = [];

    // Recorremos los pedidos
    pedidos.forEach((pedido) => {
      // Filtro de seguridad: Solo Rx
      if (
        !pedido.tipoEstudio ||
        !pedido.tipoEstudio.toLowerCase().includes("radiografia")
      ) {
        return;
      }

      // Determinamos el texto a analizar
      let textoSolicitud = "";
      if ("solicitud" in pedido) {
        textoSolicitud = pedido.solicitud;
        if (pedido.lugar.toLowerCase() == "en cama") {
          textoSolicitud = "CAMA";
        }
      }

      if ("pedido" in pedido) {
        textoSolicitud = pedido.pedido + " " + pedido.observaciones;
        if (pedido.realizado) return;
      }

      REGLAS_DETECCION.forEach((regla) => {
        if (regla.regex.test(textoSolicitud)) {
          const encontrado = prestaciones.find((item) => {
            const textoComparar = item.tag || item.descripcion;
            // IMPORTANTE: El 'return' es obligatorio si usas { }
            //console.log(
            //  `Comparacion ${textoComparar.toUpperCase()} - ${regla.match} Resultado: ${textoComparar.toUpperCase().includes(regla.match)}`,
            //);
            return textoComparar.toUpperCase().includes(regla.match);
          });

          if (encontrado) {
            nuevasDetectadas.push({ ...encontrado, origen: "AUTO" } as any);
          }
        }
      });
    });

    // Actualizamos el estado UNA SOLA VEZ al final del proceso
    if (nuevasDetectadas.length > 0) {
      setExposiciones(nuevasDetectadas);
    }
    setAutoDeteccionRealizada(true);
  }, [pedidos, prestaciones]);

  // ... (Tus funciones de agregar/quitar/confirmar siguen igual)
  const agregarExposicion = (item: IConsumoItem) => {
    setExposiciones((prev) => [...prev, { ...item, origen: "MANUAL" }]);
  };

  const quitarExposicionPorDescripcion = (descripcion: string) => {
    setExposiciones((prev) => {
      const index = prev.findIndex((item) => item.descripcion === descripcion);
      if (index === -1) return prev;
      const nuevaLista = [...prev];
      nuevaLista.splice(index, 1);
      return nuevaLista;
    });
  };

  const limpiarTodo = () => setExposiciones([]);

  const confirmarConsumo = async (
    idPacienteInterno: string,
    idCobertura: string,
    sistema: string,
  ) => {
    if (exposiciones.length === 0) return;
    setGuardandoConsumos(true);
    try {
      const res: IResultadoLoteConsumo = await InternoService.registrarConsumos(
        idPacienteInterno,
        idCobertura,
        sistema,
        exposiciones,
      );
      const resultados = res.data.resultados;

      console.log("Resultados", resultados);
      const errores = resultados.filter((r) => !r.exito);
      console.log("Errores", errores);
      const exitos = resultados.filter((r) => r.exito);
      console.log("Exitos", exitos);
      if (errores.length > 0) {
        toast.warning(
          <>
            {`Consumos de ${pacienteInterno?.apellidos.split(" ")[0]} ${pacienteInterno?.nombres.split(" ")[0]} enviados con errores:`}
            <br />
            {`Exitosos ${exitos.length}`}
            <br />
            {`Errores: ${errores.length}`}
          </>,
        );
        exitos.map((exito) => {
          quitarExposicionPorDescripcion(exito.prestacion);
        });
      } else {
        toast.success(
          `Todos los consumos de ${pacienteInterno?.apellidos.split(" ")[0]} ${pacienteInterno?.nombres.split(" ")[0]} enviados correctamente (${exitos.length})`,
        );
        limpiarTodo();
      }
    } catch (error) {
      console.error(error);
      toast.error(`Error al guardar: ${getErrorMessage(error)}`);
    } finally {
      setGuardandoConsumos(false);
    }
  };

  const buscarPacienteInterno = useCallback(async (dni: string | null) => {
    if (!dni || dni.length < 7) return;

    setLoadingPaciente(true);
    setErrorPaciente(false);
    setPacienteInterno(null);

    try {
      // Asumimos que buscas por DNI, el segundo param es HC (null por ahora)
      const paciente = await InternoService.buscarPacienteInterno(dni, null);

      if (paciente) {
        setPacienteInterno(paciente);
      } else {
        // Si el servicio devuelve null/undefined pero no lanza error
        setErrorPaciente(true);
      }
    } catch (error) {
      console.error("Paciente no encontrado en sistema interno");
      setErrorPaciente(true);
      toast.error("Paciente no vinculado al sistema administrativo");
    } finally {
      setLoadingPaciente(false);
    }
  }, []);

  return {
    prestaciones,
    exposiciones,
    loadingCatalogo,
    guardandoConsumos,
    agregarExposicion,
    quitarExposicionPorDescripcion,
    limpiarTodo,
    confirmarConsumo,
    buscarPacienteInterno,
    pacienteInterno,
    loadingPaciente,
    errorPaciente,
  };
};
