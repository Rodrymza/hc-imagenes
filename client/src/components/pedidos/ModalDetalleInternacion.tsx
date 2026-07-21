import {
  X,
  User,
  Calendar,
  Baby,
  FileDigit,
  Stethoscope,
  Clock,
  MapPin,
  Info,
  AlertCircle,
  UserX,
  Loader2,
  RefreshCw,
  FileText,
  Activity,
} from "lucide-react";
import type { IPedidoInternacion } from "@/types/pedidos";
import { capitalize, getEstiloEstudio, getLugarEstilo } from "./utils";
import { useConsumos } from "@/hooks/useConsumos";
import { PanelConsumos } from "./PanelConsumos";
import { PanelPacienteEncontrado } from "./PanelPacienteEncontrado";
import { useEffect, useMemo, useState } from "react";

interface ModalDetalleInternacionProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: IPedidoInternacion | null;
}

export const ModalDetalleInternacion = ({
  isOpen,
  onClose,
  pedido,
}: ModalDetalleInternacionProps) => {
  const pedidosMemo = useMemo(() => (pedido ? [pedido] : []), [pedido]);

  const {
    exposiciones,
    agregarExposicion,
    confirmarConsumo,
    guardandoConsumos,
    prestaciones,
    quitarExposicionPorDescripcion,
    errorPaciente,
    loadingPaciente,
    buscarPacienteInterno,
    pacienteInterno,
  } = useConsumos(pedidosMemo);

  const [coberturaSeleccionada, setCoberturaSeleccionada] = useState("");
  const ID_COBERTURA_PARTICULAR = "09999";
  const SISTEMA_INTERNACION = "internacion";

  const handleImputar = async () => {
    if (!pedido) return;
    const coberturaFinal =
      coberturaSeleccionada ||
      pacienteInterno?.coberturas[0]?.idCobertura ||
      ID_COBERTURA_PARTICULAR;

    await confirmarConsumo(
      pedido.hclinica,
      coberturaFinal,
      SISTEMA_INTERNACION,
    );
  };

  const reintentarBusqueda = async () => {
    if (pedido?.dni) {
      await buscarPacienteInterno(pedido.dni.toString());
    }
  };

  useEffect(() => {
    if (isOpen && pedido?.dni) {
      buscarPacienteInterno(pedido.dni.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pedido?.dni]);

  if (!isOpen || !pedido) return null;

  const estilo = getEstiloEstudio(pedido.tipoEstudio);
  const estiloLugar = getLugarEstilo(pedido.lugar);
  const esUrgente = pedido.urgente === "SI";

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Contenedor Principal (Mismas dimensiones que Guardia) */}
      <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col h-auto lg:h-[90vh] lg:overflow-hidden animate-in fade-in zoom-in-95 duration-200 mt-2 sm:mt-0">
        {" "}
        {/* --- 1. ENCABEZADO SUPERIOR --- */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex-shrink-0 relative z-20 shadow-sm">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col gap-5 pr-10">
            {/* Fila Superior: Nombre y Ubicación */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                {pedido.apellidos}, {capitalize(pedido.nombres)}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm ${estiloLugar.bg}`}
                >
                  <div className="mb-0.5">{estiloLugar.icon}</div>
                  <span className="text-sm font-black uppercase tracking-wide">
                    {pedido.lugar}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50 text-indigo-900 px-4 py-2 rounded-lg border border-indigo-200 shadow-sm">
                  <MapPin className="w-6 h-6 text-indigo-400/80" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-black uppercase tracking-wide">
                      {pedido.sala || "SIN SALA"}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-indigo-600/80">
                      {pedido.servicio || "Servicio Gral"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Inferior: Datos Filiatorios */}
            <div className="flex flex-wrap items-center justify-around gap-y-2 gap-x-6 text-base text-slate-600 font-medium border-t border-slate-200 px-8 pt-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                <span>
                  DNI:{" "}
                  <span className="text-slate-900 font-bold tracking-wider">
                    {pedido.dniString}
                  </span>
                </span>
              </div>

              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>

              {/* HISTORIA CLÍNICA (Destacado) */}
              <div className="flex items-center gap-2">
                <FileDigit className="w-5 h-5 text-indigo-500" />
                <span>
                  HC:{" "}
                  <span className="text-indigo-900 font-black">
                    {pedido.hclinica}
                  </span>
                </span>
              </div>

              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>
                  Edad:{" "}
                  <span className="text-slate-900 font-bold">
                    {pedido.edad}
                  </span>
                </span>
              </div>

              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>

              <div className="flex items-center gap-2 text-slate-500">
                <Baby className="w-5 h-5 text-slate-400" />
                <span className="text-sm">
                  Nac:{" "}
                  <span className="font-bold">{pedido.fechaNacimiento}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* --- 2. CUERPO DIVIDIDO EN DOS COLUMNAS --- */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-slate-100/50">
          {/* COLUMNA IZQUIERDA: Detalle del Pedido (AHORA OCUPA TODO EL ALTO) */}
          <div className="w-full lg:w-[55%] xl:w-[60%] p-6 border-r border-slate-200 flex flex-col h-full overflow-hidden">
            {/* TARJETA PRINCIPAL: flex-grow la obliga a estirarse hasta abajo */}
            <div
              className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col flex-grow ${estilo.border}`}
            >
              {/* HEADER TARJETA [tipo estudio] [fecha] */}
              <div
                className={`px-5 py-4 border-b ${estilo.border} ${estilo.bg} flex justify-between items-center gap-4 flex-shrink-0`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm ${estilo.badge}`}
                  >
                    {estilo.icon}
                    {pedido.tipoEstudio}
                  </div>
                  {esUrgente && (
                    <div className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Urgente
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white/60 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/50">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {pedido.fecha}
                </div>
              </div>

              {/* CONTENIDO TARJETA (Scrolleable internamente si es muy largo) */}
              <div className="p-6 flex flex-col flex-grow overflow-y-auto bg-slate-50/50">
                {/* [ESTUDIO DETALLE] - Centrado en el medio de la tarjeta */}
                <div className="flex-grow flex flex-col items-center justify-center text-center py-6 min-h-[150px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-5">
                    Detalle de la Solicitud
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-snug whitespace-pre-line">
                    {pedido.solicitud}
                  </h3>
                </div>

                {/* BLOQUE INFERIOR - Pegado abajo con mt-auto */}
                <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-slate-200/60">
                  {/* [diagnostico] */}
                  <div className="flex items-center gap-3 bg-amber-50/50 p-1 rounded-xl border border-amber-100">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="w-32 text-xs text-center font-black text-slate-400 uppercase tracking-wide">
                      Diagnóstico:
                    </span>
                    <p className="text-base text-slate-800">
                      {pedido.diagnostico || "Sin diagnóstico especificado"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* [comentario] (siempre visible) */}
                    <div className="flex items-center gap-3 p-1 rounded-xl border border-amber-100">
                      <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="w-32 text-xs text-center tracking-wide font-black text-amber-700/70 uppercase block">
                        Comentario:
                      </span>
                      <span
                        className={`text-sm ${pedido.comentario ? "font-medium text-slate-700" : "italic text-amber-600/60"}`}
                      >
                        {pedido.comentario || "Sin comentarios en el pedido."}
                      </span>
                    </div>

                    {/* [nota] (siempre visible) */}
                    <div className="flex items-center gap-3 bg-amber-50/50 p-1 rounded-xl border border-amber-100">
                      <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="w-32 text-xs text-center tracking-wide font-black text-blue-700/70 uppercase block">
                        Nota Adicional:
                      </span>
                      <span
                        className={`text-sm ${pedido.nota ? "font-medium text-slate-700" : "italic text-blue-600/60"}`}
                      >
                        {pedido.nota || "Sin notas adicionales."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER TARJETA (Solo visual, mismo estilo que el header) */}
              <div
                className={`px-3 py-3 ${estilo.border} ${estilo.bg} flex flex-col sm:flex-row justify-between items-center gap-4`}
              >
                <div className="flex items-center gap-3 font-bold text-slate-700 bg-white/80 p-2  rounded-xl shadow-sm border border-slate-200/50 w-full sm:w-auto">
                  <Stethoscope className="w-5 h-5 text-indigo-500" />
                  <span className="uppercase text-center w-32 tracking-tight text-sm text-slate-400">
                    Solicitante:
                  </span>
                  <span className="truncate max-w-[200px] pr-3">
                    {pedido.solicitante}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Imputación de Consumos */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col bg-slate-50 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10">
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-black text-sm">
                <Activity className="w-5 h-5 text-indigo-400" />
                Carga de Exposiciones
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-3">
              {/* ESTADO: Cargando */}
              {loadingPaciente && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <div>
                    <h4 className="font-black text-slate-700">
                      Conectando con Servidor
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      Buscando coberturas de internación...
                    </p>
                  </div>
                </div>
              )}

              {/* ESTADO: Error / No Encontrado */}
              {!loadingPaciente && errorPaciente && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                    <UserX className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-rose-900 uppercase">
                      Paciente No Vinculado
                    </h4>
                    <p className="text-sm text-rose-700 font-medium mt-1">
                      No figura en el sistema administrativo. Contacte a
                      admisión.
                    </p>
                  </div>
                  <button
                    onClick={reintentarBusqueda}
                    className="mt-2 px-6 py-2.5 bg-white border-2 border-rose-200 text-rose-700 text-sm font-black uppercase rounded-xl hover:bg-rose-100 hover:border-rose-300 transition-all shadow-sm flex items-center gap-2 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar Búsqueda
                  </button>
                </div>
              )}

              {/* ESTADO: Listo para Cargar */}
              {!loadingPaciente && !errorPaciente && pacienteInterno && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <PanelPacienteEncontrado
                    paciente={pacienteInterno}
                    idCoberturaSeleccionada={coberturaSeleccionada}
                    onChangeCobertura={setCoberturaSeleccionada}
                  />
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <PanelConsumos
                      exposiciones={exposiciones}
                      prestaciones={prestaciones}
                      onAdd={agregarExposicion}
                      onRemove={quitarExposicionPorDescripcion}
                      onConfirm={handleImputar}
                      isSaving={guardandoConsumos}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
