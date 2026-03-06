import type { IEnvioComentario, IPedidoInternacion } from "@/types/pedidos";
import axios from "axios";

const isProd = import.meta.env.PROD;

// 1. Definir la URL base correctamente
axios.defaults.baseURL = isProd
  ? `http://${window.location.hostname}:3000` // Producción (IP del server)
  : "http://localhost:3000"; // Desarrollo (Tu PC local)

// 2. IMPORTANTE: Activar credenciales
axios.defaults.withCredentials = true;

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
};
