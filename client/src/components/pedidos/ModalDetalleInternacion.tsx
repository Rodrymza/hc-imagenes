import {
  X,
  User,
  Calendar, // Para edad
  Baby, // Para nacimiento
  FileDigit, // Para Historia Clínica
  Stethoscope, // Doctor
  Clock, // Fecha
  MapPin,
  Info, // Para notas/comentarios
  AlertCircle,
  UserX,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { IPedidoInternacion } from "@/types/pedidos"; // Ajusta el import según tu estructura
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
  if (!isOpen || !pedido) return null;
  const pedidosMemo = useMemo(() => [pedido], [pedido]);

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
  const [dniBusqueda, setDniBusqueda] = useState(pedido.dni.toString());
  const estilo = getEstiloEstudio(pedido.tipoEstudio);
  const esUrgente = pedido.urgente === "SI";
  const ID_COBERTURA_PARTICULAR = "09999";
  const SISTEMA_INTERNACION = "internacion";
  const estiloLugar = getLugarEstilo(pedido.lugar);
  const handleImputar = async () => {
    const coberturaFinal =
      coberturaSeleccionada ||
      pacienteInterno?.coberturas[0].idCobertura ||
      ID_COBERTURA_PARTICULAR;

    await confirmarConsumo(
      pedido.hclinica,
      coberturaFinal,
      SISTEMA_INTERNACION,
    );
    // "0" es placeholder de cobertura si no la tienes, ajusta según tu backend
  };

  const reintentarBusqueda = async () => {
    await buscarPacienteInterno(pedido.dni.toString());
  };

  useEffect(() => {
    if (dniBusqueda.length >= 7) {
      buscarPacienteInterno(dniBusqueda);
    }
  }, [dniBusqueda]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* --- 1. ENCABEZADO (Contexto Paciente + Ubicación) --- */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex-shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col gap-5 pr-10">
            {/* Fila Superior: Nombre y Ubicación */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-black text-slate-800  tracking-tight leading-none">
                {pedido.apellidos}, {capitalize(pedido.nombres)}
              </h2>
              <div
                className={`flex flex-col items-center gap-3 px-2 py-2 rounded-lg border ${estiloLugar.bg} shadow-sm min-w-[200px] justify-center`}
              >
                <div className="flex flex-row items-center text-center leading-tight">
                  <div className="mb-1">{estiloLugar.icon}</div>

                  <span className="text-lg font-black uppercase tracking-wide">
                    {pedido.lugar}
                  </span>
                </div>
              </div>

              {/* Badge de Ubicación (Internación Style) */}
              <div className="flex items-center gap-3 bg-indigo-50 text-indigo-900 px-4 py-2 rounded-lg border border-indigo-200 shadow-sm min-w-[200px] justify-center">
                <MapPin className="w-8 h-8 text-indigo-400/80" />
                <div className="flex flex-col text-center leading-tight">
                  {/* Sala/Cama Arriba (Dato Duro) */}
                  <span className="text-lg font-black uppercase tracking-wide">
                    {pedido.sala || "SIN SALA"}
                  </span>
                  {/* Servicio Abajo (Contexto) */}
                  <span className="text-xs font-bold uppercase text-indigo-600/80">
                    {pedido.servicio || "Servicio Gral"}
                  </span>
                </div>
              </div>
            </div>

            {/* Fila Inferior: Datos Filiatorios (Agregado HC) */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-base text-slate-600 font-medium border-t border-slate-200 pt-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                <span>
                  DNI:{" "}
                  <span className="text-slate-900 font-bold">
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

              <div className="flex items-center gap-2 text-base text-violet-600">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="font-medium">
                  Fecha Solicitud:{" "}
                  <span className="text-purple-900">{pedido.fecha}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. CUERPO (Tarjeta del Pedido) --- */}
        <div className="overflow-y-auto p-4 bg-slate-100/50 flex-grow">
          <div
            className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${estilo.border}`}
          >
            {/* Header Tarjeta */}
            <div
              className={`p-5 border-b ${estilo.border} ${estilo.bg} flex justify-between items-start gap-4`}
            >
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  {/* Tipo Estudio */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-sm ${estilo.badge}`}
                  >
                    {estilo.icon}
                    {pedido.tipoEstudio}
                  </div>

                  {/* URGENCIA (No invasiva) */}
                  {esUrgente && (
                    <div className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wide">
                        Pedido Urgente
                      </span>
                    </div>
                  )}
                </div>

                {/* Solicitud (Título) */}
                <h3 className="text-2xl font-bold  text-center text-black whitespace-pre-line">
                  {pedido.solicitud}
                </h3>
              </div>
            </div>

            {/* Contenido Clínico y Notas */}
            <div className="p-4 space-y-5">
              {/* 1. Diagnóstico (Principal - Amarillo) */}
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-300 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-amber-800 uppercase bg-amber-100 px-2 py-1 rounded whitespace-nowrap">
                    Diagnóstico
                  </span>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {pedido.diagnostico || "Sin diagnóstico especificado"}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm self-start sm:self-center">
                  <Stethoscope className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase truncate max-w-[180px]">
                    {pedido.solicitante}
                  </span>
                </div>
              </div>

              {/* 2. Notas y Comentarios (Secundarios - Gris/Azulino) */}
              {(pedido.comentario || pedido.nota) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-700">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />

                  {pedido.comentario && (
                    <span>
                      <span className="font-semibold text-slate-500">
                        Comentario:
                      </span>{" "}
                      <span className="italic">{pedido.comentario}</span>
                    </span>
                  )}

                  {pedido.nota && (
                    <span className="flex gap-1">
                      {pedido.comentario && (
                        <span className="text-slate-300 mx-1">•</span>
                      )}
                      <span className="font-semibold text-slate-500">
                        Nota adicional:
                      </span>{" "}
                      <span className="italic">{pedido.nota}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- 3. ACCIÓN (Footer Fijo) --- */}

        {pedido && (
          <div className="z-20 relative">
            {/* CASO A: CARGANDO VERIFICACIÓN */}
            {loadingPaciente && (
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-center items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando paciente en sistema administrativo...
              </div>
            )}

            {/* CASO B: PACIENTE NO ENCONTRADO (Bloqueo Amarillo) */}
            {!loadingPaciente && errorPaciente && (
              <div className="bg-amber-50 border-t-4 border-amber-400 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full text-amber-700">
                    <UserX className="w-6 h-6" />{" "}
                    {/* Importar UserX de lucide-react */}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase">
                      Paciente no vinculado
                    </h4>
                    <p className="text-xs text-amber-800 font-medium">
                      No figura en el sistema administrativo. Contacte a
                      admisión.
                    </p>
                  </div>
                </div>
                <button
                  onClick={reintentarBusqueda}
                  className="px-4 py-2 bg-white border border-amber-300 text-amber-800 text-xs font-bold uppercase rounded hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> {/* Importar RefreshCw */}
                  Reintentar
                </button>
              </div>
            )}

            {/* CASO C: TODO OK (Mostrar Panel de Consumos) */}
            {!loadingPaciente && !errorPaciente && pacienteInterno && (
              <>
                {/* El Panel Verde con el Selector */}
                <PanelPacienteEncontrado
                  paciente={pacienteInterno}
                  idCoberturaSeleccionada={coberturaSeleccionada}
                  onChangeCobertura={setCoberturaSeleccionada}
                />
                <PanelConsumos
                  exposiciones={exposiciones}
                  prestaciones={prestaciones}
                  onAdd={agregarExposicion}
                  onRemove={quitarExposicionPorDescripcion}
                  onConfirm={handleImputar}
                  isSaving={guardandoConsumos}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
