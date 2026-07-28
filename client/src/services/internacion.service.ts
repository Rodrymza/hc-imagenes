import type { IEnvioComentario, IPedidoInternacion } from "@/types/pedidos";
import axios from "axios";

const isProd = import.meta.env.PROD;

// 1. Definir la URL base correctamente
axios.defaults.baseURL = isProd
  ? `http://${window.location.hostname}:3000` // Producción (IP del server)
  : "http://localhost:3000"; // Desarrollo (Tu PC local)

// 2. IMPORTANTE: Activar credenciales
axios.defaults.withCredentials = true;

export interface INotificacionesConfig {
  ENVIOS_DESACTIVADOS: boolean;
  HORA_INICIO: number;
  HORA_FIN: number;
  EXCLUIR_TERAPIAS: boolean;
  DIAS_PERMITIDOS: number[];
}

export const InternacionService = {
  getPedidos: async (fecha?: string): Promise<IPedidoInternacion[]> => {
    const url = fecha
      ? `/api/internacion/pedidos?fecha=${fecha}`
      : "/api/internacion/pedidos";
    const res = await axios.get(url);
    return res.data;
  },

  enviarComentario: async (body: IEnvioComentario) => {
    const res = await axios.post("/api/internacion/comentarios", body);
    return res.data;
  },

  getConfigNotificaciones: async (): Promise<INotificacionesConfig> => {
    const res = await axios.get("/api/internacion/notificaciones/config");
    return res.data;
  },

  updateConfigNotificaciones: async (
    config: Partial<INotificacionesConfig>,
  ): Promise<{ ok: boolean; config: INotificacionesConfig }> => {
    const res = await axios.put("/api/internacion/notificaciones/config", config);
    return res.data;
  },
};
