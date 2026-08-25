import {
  X,
  User,
  MapPin,
  Calendar,
  Stethoscope,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Baby,
  Loader2,
  Save,
  UserX,
  RefreshCw,
} from "lucide-react";
import type { IPedidoGuardia, IDetallePedidoGuardia } from "@/types/pedidos";
import { capitalize, getEstiloEstudio } from "./utils";
import { useEffect, useState } from "react";
import { useConsumos } from "@/hooks/useConsumos";
import { PanelConsumos } from "./PanelConsumos";
import { PanelPacienteEncontrado } from "./PanelPacienteEncontrado";
import { toast } from "sonner";
import type { IPacienteGuardia } from "@/types/pacientes";

interface ModalDetalleGuardiaProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: IPacienteGuardia;
  pedidoGeneral: IPedidoGuardia;
  pedidos: IDetallePedidoGuardia[];
  loadingPedidosPaciente: boolean;
  onFinalizarEstudio: (idEstudio: string) => void;
}

export const ModalDetalleGuardia = ({
  isOpen,
  onClose,
  paciente,
  pedidoGeneral,
  pedidos,
  loadingPedidosPaciente,
  onFinalizarEstudio,
}: ModalDetalleGuardiaProps) => {
  const ID_COBERTURA_PARTICULAR = "09999";
  const SISTEMA_GUARDIA = "guardia";
  const [dniPaciente, setDniPaciente] = useState("");
  const [procesando, setProcesando] = useState<Set<string>>(new Set());
  const [coberturaSeleccionada, setCoberturaSeleccionada] = useState("");
  const [modalReady, setModalReady] = useState(false);
  const [dniBuscado, setDniBuscado] = useState("");

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
  } = useConsumos(pedidos);

  const handleImputar = async () => {
    if (!pacienteInterno) {
      toast.error("No se cargó la información del paciente");
      return;
    }

    const hclinica = pacienteInterno.idPaciente;
    const coberturaPaciente = pacienteInterno.coberturas[0]?.idCobertura;
    const coberturaFinal =
      coberturaSeleccionada || coberturaPaciente || ID_COBERTURA_PARTICULAR;

    await confirmarConsumo(hclinica, coberturaFinal, SISTEMA_GUARDIA);
  };

  const reintentarBusqueda = async () => {
    await buscarPacienteInterno(dniPaciente);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (paciente?.dni) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDniPaciente(paciente.dni.toString());
    }
  }, [isOpen, paciente]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModalReady(false);
      return;
    }
    // dejamos que el modal se pinte primero
    requestAnimationFrame(() => setModalReady(true));
  }, [isOpen]);

  useEffect(() => {
    if (!modalReady) return;
    if (dniPaciente.length >= 7 && dniPaciente !== dniBuscado) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDniBuscado(dniPaciente);
      buscarPacienteInterno(dniPaciente);
    }
  }, [modalReady, dniPaciente, dniBuscado, buscarPacienteInterno]);

  if (!isOpen || !paciente) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Contenedor Principal del Modal */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-7xl bg-card rounded-2xl shadow-2xl flex flex-col h-auto lg:h-[90vh] lg:overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* --- 1. ENCABEZADO SUPERIOR --- */}
          <div className="flex flex-col items-center justify-around bg-muted border-b border-border p-4 shadow-sm flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col gap-1 pr-10 ">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h2 className="text-2xl font-black text-foreground tracking-tight leading-none">
                  {paciente.apellido}, {capitalize(paciente.nombres)}
                </h2>

                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 px-4 py-1.5 rounded-full border border-red-200 dark:border-red-900 w-fit shadow-sm">
                  <MapPin className="w-5 h-5 fill-red-800/20" />
                  <span className="text-lg font-bold uppercase">
                    {pedidoGeneral?.ubicacion || "Sin ubicación"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm p-1 text-muted-foreground font-medium mt-1 border-t border-border">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>
                    DNI:{" "}
                    <span className="text-foreground font-bold tracking-wider">
                      {paciente.dniString}
                    </span>
                  </span>
                </div>
                <div className="w-px h-5 bg-border hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span>
                    Edad:{" "}
                    <span className="text-foreground font-bold">
                      {paciente.edad} Años
                    </span>
                  </span>
                </div>
                <div className="w-px h-5 bg-border hidden sm:block"></div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Baby className="w-5 h-5 text-muted-foreground" />
                  <span>
                    Nacimiento:{" "}
                    <span className="text-foreground/80 font-bold">
                      {paciente.fechaNacimientoString}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* --- 2. CUERPO DIVIDIDO EN DOS COLUMNAS --- */}
          <div className="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0 bg-muted/40">
            {/* COLUMNA IZQUIERDA: Listado de Pedidos */}
            <div className="w-full lg:w-[55%] xl:w-[60%] overflow-y-auto min-h-0 p-4 lg:p-6 border-r border-border">
              <div className="mb-6 flex items-center gap-2 text-muted-foreground uppercase tracking-widest font-black text-sm">
                <FileText className="w-5 h-5 text-indigo-400" />
                Estudios Solicitados
              </div>

              {loadingPedidosPaciente ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Clock className="w-12 h-12 text-indigo-400 animate-spin" />
                  <span className="text-lg font-medium text-muted-foreground">
                    Cargando pedidos del paciente...
                  </span>
                </div>
              ) : pedidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
                  <FileText className="w-24 h-24 mb-4 stroke-1" />
                  <p className="text-xl font-medium">
                    No hay pedidos pendientes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {[...pedidos]
                    .sort((a, b) => {
                      if (a.realizado !== b.realizado)
                        return a.realizado ? 1 : -1;
                      return 0;
                    })
                    .map((pedido) => {
                      const estaProcesando = procesando.has(pedido.idEstudio);
                      const estilo = pedido.realizado
                        ? {
                            bg: "bg-emerald-100 dark:bg-emerald-950/60",
                            border: "border-emerald-200 dark:border-emerald-800",
                            text: "text-emerald-700 dark:text-emerald-300",
                            badge:
                              "bg-emerald-600 dark:bg-emerald-700 text-white",
                            icon: (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ),
                          }
                        : getEstiloEstudio(pedido.tipoEstudio);
                      const deshabilitado =
                        pedido.realizado ||
                        estaProcesando ||
                        pedido.tipoEstudio !== "Radiografia";

                      return (
                        <div
                          key={pedido.idEstudio}
                          className={`bg-card rounded-2xl border-2 shadow-sm overflow-hidden hover:shadow-md transition-all ${estilo.border}`}
                        >
                          {/* Header Tarjeta */}
                          <div
                            className={`p-2.5 border-b ${estilo.border} ${estilo.bg}`}
                          >
                            <div className="flex justify-between items-center">
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest ${estilo.badge}`}
                              >
                                {estilo.icon}
                                {pedido.tipoEstudio}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bold bg-white/50 dark:bg-white/10 px-3 py-1 rounded-md">
                                <Clock className="w-4 h-4" />
                                <span>{pedido.fecha}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cuerpo Tarjeta */}
                          <div className="p-3 space-y-2 bg-card">
                            <div>
                              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                                Práctica Solicitada
                              </span>
                              <h3
                                className={`text-lg text-center py-2 font-bold ${pedido.realizado ? "text-green-900 dark:text-green-300" : "text-foreground"}  leading-snug whitespace-pre-line`}
                              >
                                {pedido.pedido}
                              </h3>
                            </div>

                            {pedido.observaciones && (
                              <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-1 rounded-xl border border-amber-100 dark:border-amber-900">
                                {" "}
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <span className="w-32 text-xs text-center tracking-wide font-black text-amber-700/70 dark:text-amber-400/80 uppercase block">
                                  Observaciones:
                                </span>
                                <p className="text-sm font-medium text-foreground/90">
                                  {pedido.observaciones}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-1 rounded-xl border border-amber-100 dark:border-amber-900">
                              <Activity className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                              <span className="w-32 text-xs text-center font-black text-muted-foreground uppercase tracking-wide">
                                Diagnóstico:
                              </span>
                              <p className="text-base text-foreground">
                                {pedido.diagnostico ||
                                  "Sin diagnóstico especificado"}
                              </p>
                            </div>
                          </div>

                          {/* Footer Tarjeta / Acción */}
                          <div
                            className={`px-3 py-1 ${estilo.border} ${estilo.bg} flex flex-col sm:flex-row justify-between items-center gap-4`}
                          >
                            <div className="flex items-center gap-3 font-bold text-foreground bg-card/80 p-1  rounded-xl shadow-sm border border-border/50 w-full sm:w-auto">
                              <Stethoscope className="w-5 h-5 text-indigo-500" />
                              <span className="uppercase text-center w-32 tracking-tight text-sm text-muted-foreground">
                                Solicitante:
                              </span>
                              <span className="truncate max-w-[200px] pr-3">
                                {pedido.doctor}
                              </span>
                            </div>
                            <button
                              disabled={deshabilitado}
                              onClick={async () => {
                                setProcesando((prev) =>
                                  new Set(prev).add(pedido.idEstudio),
                                );
                                try {
                                  onFinalizarEstudio(pedido.idEstudio);
                                } catch {
                                  // error handled by parent
                                } finally {
                                  setProcesando((prev) => {
                                    const nuevo = new Set(prev);
                                    nuevo.delete(pedido.idEstudio);
                                    return nuevo;
                                  });
                                }
                              }}
                              className={`
                            flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all w-full sm:w-auto
                            ${
                              deshabilitado
                                ? pedido.realizado
                                  ? "bg-emerald-50 text-emerald-400 border border-emerald-100 cursor-not-allowed dark:bg-emerald-950/40 dark:border-emerald-900"
                                  : "bg-muted text-muted-foreground cursor-not-allowed border-none"
                                : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-md active:scale-95"
                            }
                          `}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              {pedido.realizado
                                ? "Transferido"
                                : estaProcesando
                                  ? "Procesando..."
                                  : "Transferir pedido"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: Imputación de Consumos */}
            <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col min-h-0 bg-muted/40 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10">
              <div className="p-3 border-b border-border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest font-black text-sm">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Carga de Materiales
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Imputación directa a Worklist
                </p>
              </div>

              <div className="flex-grow overflow-y-auto min-h-0 p-4 flex flex-col gap-4">
                {/* ESTADO: Cargando */}
                {loadingPaciente && (
                  <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <div>
                      <h4 className="font-black text-foreground">
                        Conectando con Servidor
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium">
                        Buscando coberturas del paciente...
                      </p>
                    </div>
                  </div>
                )}

                {/* ESTADO: Error / No Encontrado */}
                {errorPaciente && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-500">
                      <UserX className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-rose-900 dark:text-rose-300 uppercase">
                        Paciente No Vinculado
                      </h4>
                      <p className="text-sm text-rose-700 dark:text-rose-400 font-medium mt-1">
                        Este DNI no registra ingreso en el sistema
                        administrativo central.
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
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
