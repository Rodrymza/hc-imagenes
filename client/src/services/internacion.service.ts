import type { IEnvioComentario, IPedidoInternacion } from "@/types/pedidos";
import axios from "axios";

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
