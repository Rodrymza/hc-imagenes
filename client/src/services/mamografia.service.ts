import axios from "axios";
import type {
  IContactoPaciente,
  IEstadisticaFiltros,
  IEstadisticaRow,
  IEstudioConHallazgos,
  IEstudioDetalle,
  IEstudioPayload,
  IFiltrosRegistros,
  IHistorialPaciente,
  IPacienteMamografia,
  IPaginacionRegistros,
} from "@/types/mamografia";

export const MamografiaService = {
  buscarPaciente: async (
    dni: string,
    signal?: AbortSignal,
  ): Promise<IHistorialPaciente> => {
    const res = await axios.get("/api/mamografia/paciente", {
      params: { dni },
      signal,
    });
    return res.data;
  },

  crearPacienteManual: async (data: {
    dni: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string | null;
    telefono?: string | null;
    email?: string | null;
    domicilio?: string | null;
  }): Promise<IHistorialPaciente> => {
    const res = await axios.post("/api/mamografia/paciente", data);
    return res.data;
  },

  getHistorial: async (id: number): Promise<IHistorialPaciente> => {
    const res = await axios.get(`/api/mamografia/paciente/${id}/historial`);
    return res.data;
  },

  actualizarPaciente: async (
    id: number,
    data: Partial<IPacienteMamografia> & IContactoPaciente,
  ): Promise<{ success: boolean; paciente: IPacienteMamografia }> => {
    const res = await axios.put(`/api/mamografia/paciente/${id}`, data);
    return res.data;
  },

  crearEstudio: async (
    payload: IEstudioPayload,
  ): Promise<{
    success: boolean;
    message: string;
    data: { estudio: IEstudioConHallazgos; origen: "local" };
  }> => {
    const res = await axios.post("/api/mamografia/estudios", payload);
    return res.data;
  },

  getEstudio: async (id: number): Promise<IEstudioDetalle> => {
    const res = await axios.get(`/api/mamografia/estudios/${id}`);
    return res.data;
  },

  eliminarEstudio: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`/api/mamografia/estudios/${id}`);
    return res.data;
  },

  getEstadisticas: async (
    filtros: IEstadisticaFiltros,
  ): Promise<IEstadisticaRow[]> => {
    const res = await axios.get("/api/mamografia/estadisticas", {
      params: filtros,
    });
    return res.data;
  },

  getRegistros: async (
    filtros: IFiltrosRegistros,
  ): Promise<IPaginacionRegistros> => {
    const params: Record<string, string | number> = {};
    if (filtros.q) params.q = filtros.q;
    if (filtros.desde) params.desde = filtros.desde;
    if (filtros.hasta) params.hasta = filtros.hasta;
    if (filtros.turno) params.turno = filtros.turno;
    params.pagina = filtros.pagina ?? 1;
    params.porPagina = filtros.porPagina ?? 15;
    const res = await axios.get("/api/mamografia/registros", { params });
    return res.data;
  },
};