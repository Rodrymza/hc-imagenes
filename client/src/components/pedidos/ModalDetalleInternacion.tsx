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
  Save,
  RefreshCw,
  FileText,
  Activity,
  Pencil,
  Trash2,
} from "lucide-react";
import type { IPedidoInternacion } from "@/types/pedidos";
import { capitalize, getEstiloEstudio, getLugarEstilo } from "./utils";
import { useConsumos } from "@/hooks/useConsumos";
import { PanelConsumos } from "./PanelConsumos";
import { PanelPacienteEncontrado } from "./PanelPacienteEncontrado";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ModalDetalleInternacionProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: IPedidoInternacion | null;
  onGuardarNota?: (item: IPedidoInternacion, nota: string) => void;
}

export const ModalDetalleInternacion = ({
  isOpen,
  onClose,
  pedido,
  onGuardarNota,
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
  const [notaLocal, setNotaLocal] = useState(pedido?.nota ?? "");
  const [editarNota, setEditarNota] = useState(false);
  const ID_COBERTURA_PARTICULAR = "09999";
  const SISTEMA_INTERNACION = "internacion";

  const [pedidoIdPrev, setPedidoIdPrev] = useState(pedido?.idEstudio);
  if (pedidoIdPrev !== pedido?.idEstudio) {
    setPedidoIdPrev(pedido?.idEstudio);
    setNotaLocal(pedido?.nota ?? "");
    setEditarNota(false);
  }

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Contenedor Principal (Mismas dimensiones que Guardia) */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-7xl bg-card rounded-2xl shadow-2xl flex flex-col h-auto lg:h-[90vh] lg:overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {" "}
          {/* --- 1. ENCABEZADO SUPERIOR --- */}
          <div className="bg-muted border-b border-border p-4 flex-shrink-0 relative z-20 shadow-sm">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col gap-3 pr-10">
              {/* Fila Superior: Nombre y Ubicación */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-black text-foreground tracking-tight leading-none">
                  {pedido.apellidos}, {capitalize(pedido.nombres)}
                </h2>

                <div className="flex flex-wrap items-center gap-3 px-4">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm ${estiloLugar.bg}`}
                  >
                    <div className="mb-0.5">{estiloLugar.icon}</div>
                    <span className="text-sm font-black uppercase tracking-wide">
                      {pedido.lugar}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <MapPin className="w-6 h-6 text-indigo-400/80" />
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-2xl font-black uppercase tracking-wide">
                        {pedido.sala || "SIN SALA"}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-indigo-600/80 dark:text-indigo-400/80">
                        {pedido.servicio || "Servicio Gral"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila Inferior: Datos Filiatorios */}
              <div className="flex flex-wrap items-center justify-around gap-y-1 gap-x-6 text-sm text-muted-foreground font-medium border-t border-border px-4 pt-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>
                    DNI:{" "}
                    <span className="text-foreground font-bold tracking-wider">
                      {pedido.dniString}
                    </span>
                  </span>
                </div>

                <div className="w-px h-5 bg-border hidden sm:block"></div>

                {/* HISTORIA CLÍNICA (Destacado) */}
                <div className="flex items-center gap-2">
                  <FileDigit className="w-5 h-5 text-indigo-500" />
                  <span>
                    HC:{" "}
                    <span className="text-indigo-900 dark:text-indigo-300 font-black">
                      {pedido.hclinica}
                    </span>
                  </span>
                </div>

                <div className="w-px h-5 bg-border hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span>
                    Edad:{" "}
                    <span className="text-foreground font-bold">
                      {pedido.edad}
                    </span>
                  </span>
                </div>

                <div className="w-px h-5 bg-border hidden sm:block"></div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Baby className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">
                    Nac:{" "}
                    <span className="font-bold">{pedido.fechaNacimiento}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* --- 2. CUERPO DIVIDIDO EN DOS COLUMNAS --- */}
          <div className="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0 bg-muted/40">
            {/* COLUMNA IZQUIERDA: Detalle del Pedido (AHORA OCUPA TODO EL ALTO) */}
            <div className="w-full lg:w-[55%] xl:w-[60%] p-4 lg:p-6 border-r border-border flex flex-col h-full overflow-hidden min-h-0">
              {/* TARJETA PRINCIPAL: flex-grow la obliga a estirarse hasta abajo */}
              <div
                className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col flex-grow min-h-0 ${estilo.border}`}
              >
                {/* HEADER TARJETA [tipo estudio] [fecha] */}
                <div
                  className={`px-4 py-2.5 border-b ${estilo.border} ${estilo.bg} flex justify-between items-center gap-4 flex-shrink-0`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest ${estilo.badge}`}
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
                <div className="p-4 flex flex-col flex-grow overflow-y-auto min-h-0 bg-card">
                  {/* [ESTUDIO DETALLE] - Centrado en el medio de la tarjeta */}
                  <div className="flex-grow flex flex-col items-center justify-center text-center py-3 min-h-[110px]">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">
                      Detalle de la Solicitud
                    </span>
                    <h3 className="text-2xl font-bold text-foreground leading-snug whitespace-pre-line">
                      {pedido.solicitud}
                    </h3>
                  </div>

                  {/* BLOQUE INFERIOR - Pegado abajo con mt-auto */}
                  <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-border/60">
                    {/* [diagnostico] */}
                    <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-1 rounded-xl border border-amber-100 dark:border-amber-900">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span className="w-32 text-xs text-center font-black text-muted-foreground uppercase tracking-wide">
                        Diagnóstico:
                      </span>
                      <p className="text-base text-foreground">
                        {pedido.diagnostico || "Sin diagnóstico especificado"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* [comentario] (siempre visible) */}
                      <div className="flex items-center gap-3 p-1 rounded-xl border border-amber-100 dark:border-amber-900">
                        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="w-32 text-xs text-center tracking-wide font-black text-amber-700/70 dark:text-amber-400/80 uppercase block">
                          Comentario:
                        </span>
                        <span
                          className={`text-sm ${pedido.comentario ? "font-medium text-foreground/90" : "italic text-amber-600/60 dark:text-amber-500/60"}`}
                        >
                          {pedido.comentario || "Sin comentarios en el pedido."}
                        </span>
                      </div>

                      {/* [nota] (siempre visible) */}
                      <div
                        className={`flex items-center gap-3 p-1 rounded-xl border ${
                          notaLocal.trim()
                            ? "border border-amber-200 border-l-4 border-l-amber-400 bg-amber-50 shadow-sm dark:bg-amber-950/30 dark:border-amber-800 dark:border-l-amber-600"
                            : "border-amber-100 dark:border-amber-900"
                        }`}
                      >
                        <FileText
                          className={`w-5 h-5 shrink-0 mt-1 ${
                            notaLocal.trim()
                              ? "text-amber-500"
                              : "text-blue-400"
                          }`}
                        />
                        <span
                          className={`w-32 text-xs text-center tracking-wide font-black uppercase block ${
                            notaLocal.trim()
                              ? "text-amber-700/70 dark:text-amber-400/80"
                              : "text-blue-700/70 dark:text-blue-400/80"
                          }`}
                        >
                          Nota:
                        </span>

                        {editarNota ? (
                          <div className="flex-1 flex flex-col gap-2">
                            <textarea
                              value={notaLocal}
                              onChange={(e) => setNotaLocal(e.target.value)}
                              rows={2}
                              placeholder="Escribí la nota adicional..."
                              autoFocus
                              className="w-full p-2 rounded-lg border border-blue-200 bg-white text-sm font-medium text-slate-800 placeholder-blue-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none resize-y dark:bg-card dark:text-foreground dark:border-blue-800 dark:placeholder-blue-500/60 dark:focus:ring-blue-900/40"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setNotaLocal(pedido.nota ?? "");
                                  setEditarNota(false);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground text-[11px] font-semibold uppercase tracking-wider hover:bg-accent transition-all active:scale-95"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  if (!onGuardarNota) return;
                                  const notaFinal = notaLocal.trim();
                                  setNotaLocal(notaFinal);
                                  setEditarNota(false);
                                  onGuardarNota(pedido, notaFinal);
                                }}
                                disabled={!onGuardarNota}
                                className="px-3 py-1.5 rounded-lg border border-blue-500 bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider hover:bg-blue-600 hover:border-blue-600 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`flex-1 text-sm whitespace-pre-line ${notaLocal.trim() ? "font-medium text-foreground/90" : "italic text-blue-600/60 dark:text-blue-400/60"}`}
                            >
                              {notaLocal.trim() || "Sin notas adicionales."}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setEditarNota(true)}
                                title={
                                  notaLocal.trim()
                                    ? "Editar nota"
                                    : "Agregar nota"
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-700 text-[11px] font-semibold uppercase tracking-wider hover:bg-blue-50 transition-all active:scale-95 dark:bg-card dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/50"
                              >
                                <Pencil className="w-3 h-3" />
                                {notaLocal.trim() ? "Editar" : "Agregar"}
                              </button>
                              {notaLocal.trim() && (
                                <button
                                  onClick={() => {
                                    if (!onGuardarNota) return;
                                    toast("Eliminar nota adicional", {
                                      description:
                                        "¿Seguro que querés eliminar la nota?",
                                      action: {
                                        label: "Eliminar",
                                        onClick: () => {
                                          setNotaLocal("");
                                          setEditarNota(false);
                                          onGuardarNota(pedido, "");
                                        },
                                      },
                                      cancel: {
                                        label: "Cancelar",
                                        onClick: () => {},
                                      },
                                    });
                                  }}
                                  disabled={!onGuardarNota}
                                  title="Eliminar nota"
                                  className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-card dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER TARJETA (Solo visual, mismo estilo que el header) */}
                <div
                  className={`px-3 py-3 ${estilo.border} ${estilo.bg} flex flex-col sm:flex-row justify-between items-center gap-4`}
                >
                  <div className="flex items-center gap-3 font-bold text-foreground bg-card/80 p-2  rounded-xl shadow-sm border border-border/50 w-full sm:w-auto">
                    <Stethoscope className="w-5 h-5 text-indigo-500" />
                    <span className="uppercase text-center w-32 tracking-tight text-sm text-muted-foreground">
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
            <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col min-h-0 bg-muted/40 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10">
              <div className="p-3 border-b border-border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest font-black text-sm">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Carga de Exposiciones
                </div>
              </div>

              <div className="flex-grow overflow-y-auto min-h-0 p-3 flex flex-col gap-3">
                {/* ESTADO: Cargando */}
                {loadingPaciente && (
                  <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <div>
                      <h4 className="font-black text-foreground">
                        Conectando con Servidor
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium">
                        Buscando coberturas de internación...
                      </p>
                    </div>
                  </div>
                )}

                {/* ESTADO: Error / No Encontrado */}
                {!loadingPaciente && errorPaciente && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-500">
                      <UserX className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-rose-900 dark:text-rose-300 uppercase">
                        Paciente No Vinculado
                      </h4>
                      <p className="text-sm text-rose-700 dark:text-rose-400 font-medium mt-1">
                        No figura en el sistema administrativo. Contacte a
                        admisión.
                      </p>
                    </div>
                    <button
                      onClick={reintentarBusqueda}
                      className="mt-2 px-6 py-2.5 bg-white dark:bg-card border-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-black uppercase rounded-xl hover:bg-rose-100 hover:border-rose-300 dark:hover:bg-rose-950/60 transition-all shadow-sm flex items-center gap-2 active:scale-95"
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
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                      <PanelConsumos
                        exposiciones={exposiciones}
                        prestaciones={prestaciones}
                        onAdd={agregarExposicion}
                        onRemove={quitarExposicionPorDescripcion}
                        onConfirm={handleImputar}
                        isSaving={guardandoConsumos}
                        hideConfirmButton
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÓN FIJO: Enviar a Worklist siempre visible */}
              {!loadingPaciente && !errorPaciente && pacienteInterno && (
                <div className="flex-shrink-0 p-3 border-t border-border bg-card">
                  <button
                    onClick={handleImputar}
                    disabled={exposiciones.length === 0 || guardandoConsumos}
                    className={`
                    flex items-center justify-center gap-3 w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all
                    ${
                      exposiciones.length === 0 || guardandoConsumos
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                    }
                  `}
                  >
                    {guardandoConsumos ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando consumos al sistema...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Enviar a Worklist ({exposiciones.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
