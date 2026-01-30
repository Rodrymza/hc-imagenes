import {
  X,
  User,
  MapPin,
  Calendar,
  Stethoscope,
  Activity, // Para Eco
  Layers, // Para Tomografía
  Image, // Para Rayos X
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Baby,
  Loader2,
  UserX,
  RefreshCw, // Icono nacimiento
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
  isLoading: boolean;
  onFinalizarEstudio: (idEstudio: string, dni: string) => void;
}

export const ModalDetalleGuardia = ({
  isOpen,
  onClose,
  paciente,
  pedidoGeneral,
  pedidos,
  isLoading,
  onFinalizarEstudio,
}: ModalDetalleGuardiaProps) => {
  const ID_COBERTURA_PARTICULAR = "099999";
  const SISTEMA_GUARDIA = "guardia";
  const [dniPaciente, setDniPaciente] = useState("");
  const [procesando, setProcesando] = useState<Set<string>>(new Set());
  const [coberturaSeleccionada, setCoberturaSeleccionada] = useState("");
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
    const coberturaPaciente = pacienteInterno.coberturas[0].idCobertura;
    const coberturaFinal =
      coberturaSeleccionada || coberturaPaciente || ID_COBERTURA_PARTICULAR;

    console.log(
      "Datos a enviar: ",
      hclinica,
      coberturaSeleccionada,
      exposiciones,
    );
    await confirmarConsumo(hclinica, coberturaFinal, SISTEMA_GUARDIA);
  };

  const reintentarBusqueda = async () => {
    await buscarPacienteInterno(dniPaciente);
  };
  useEffect(() => {
    if (paciente?.dni) {
      setDniPaciente(paciente.dni.toString());
    }
  }, [paciente]);

  useEffect(() => {
    if (dniPaciente.length >= 7) {
      buscarPacienteInterno(dniPaciente);
    }
  }, [dniPaciente, buscarPacienteInterno]);

  if (!isOpen || !paciente) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* CAMBIO: Aumentado ancho maximo a max-w-3xl */}
      <div className="relative w-full h-full sm:h-screen max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* --- 1. ENCABEZADO --- */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex-shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col gap-2 pr-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* CAMBIO: Fuente más grande (text-3xl) */}
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                {paciente.apellido}, {capitalize(paciente.nombres)}
              </h2>

              <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-1.5 rounded-full border border-red-200 w-fit shadow-sm">
                <MapPin className="w-5 h-5 fill-red-800/20" />
                <span className="text-base font-bold uppercase">
                  {pedidoGeneral?.ubicacion || "Sin ubicación"}
                </span>
              </div>
            </div>

            {/* CAMBIO: Fuentes más grandes y agregado Fecha Nacimiento */}
            <div className="flex flex-wrap items-center gap-6 text-lg text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                <span>
                  DNI:{" "}
                  <span className="text-slate-900 font-bold">
                    {paciente.dniString}
                  </span>
                </span>
              </div>
              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>
                  Edad:{" "}
                  <span className="text-slate-900 font-bold">
                    {paciente.edad} Años
                  </span>
                </span>
              </div>
              {/* CAMBIO: Agregado Fecha Nacimiento String */}
              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-slate-500">
                <Baby className="w-5 h-5 text-slate-400" />
                <span>
                  Nacimiento:{" "}
                  <span className="text-slate-700 font-bold">
                    {paciente.fechaNacimientoString}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. CUERPO --- */}
        <div className="overflow-y-auto p-6 bg-slate-100/50 flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-10 h-10 animate-spin" />
                <span className="text-base font-medium">
                  Cargando pedidos del paciente...
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 opacity-60">
              <FileText className="w-20 h-20 mb-4 stroke-1" />
              <p className="text-xl font-medium">No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {" "}
              {/* Espaciado vertical mayor entre tarjetas */}
              {pedidos.map((pedido) => {
                const estaProcesando = procesando.has(
                  pedido.idEstudio.toString(),
                );
                const estilo = getEstiloEstudio(pedido.tipoEstudio);

                return (
                  <div
                    key={pedido.idEstudio}
                    className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${estilo.border}`}
                  >
                    {/* Header de Tarjeta (Con color según tipo) */}
                    <div
                      className={`p-5 border-b ${estilo.border} ${estilo.bg} flex justify-between items-start gap-2`}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Badge Tipo Estudio Grande y Colorido */}
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-md w-fit text-xs font-black uppercase tracking-widest shadow-sm ${estilo.badge}`}
                        >
                          {estilo.icon}
                          {pedido.tipoEstudio}
                        </div>
                        {/* CAMBIO: Título más grande (text-xl a text-2xl) */}
                        <h3 className="text-2xl font-bold text-slate-800 leading-snug">
                          {pedido.pedido}
                        </h3>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-mono">
                          <Clock className="w-4 h-4" />
                          <span>{pedido.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-white/60 px-3 py-1.5 rounded border border-slate-200/50">
                          <Stethoscope className="w-4 h-4 text-slate-500" />
                          <span className="truncate max-w-[150px]">
                            {pedido.doctor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo Clínico */}
                    <div className="p-2 bg-amber-50/30 space-y-4">
                      <div className="flex gap-4">
                        <Activity className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="w-full">
                          <span className="text-xs font-bold text-amber-800 uppercase block mb-1 tracking-wider">
                            Diagnóstico
                          </span>
                          {/* CAMBIO: Texto diagnóstico más grande y legible */}
                          <p className="text-lg text-slate-800 font-medium leading-relaxed border-l-4 border-amber-200 pl-3">
                            {pedido.diagnostico ||
                              "Sin diagnóstico especificado"}
                          </p>
                        </div>
                      </div>

                      {pedido.observaciones &&
                        pedido.observaciones !== "Sin observaciones" && (
                          <div className="flex gap-4 pt-4 border-t border-amber-100/50">
                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-amber-800 uppercase block mb-1 tracking-wider">
                                Observaciones
                              </span>
                              <p className="text-base text-slate-700 italic">
                                {pedido.observaciones}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Footer con Acción */}
                    <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button
                        disabled={pedido.realizado || estaProcesando}
                        onClick={async () => {
                          setProcesando((prev) =>
                            new Set(prev).add(pedido.idEstudio),
                          );

                          try {
                            await onFinalizarEstudio(
                              pedido.idEstudio,
                              paciente.dni.toString(),
                            );
                          } catch (e) {
                            // si falla, liberás el botón
                            setProcesando((prev) => {
                              const nuevo = new Set(prev);
                              nuevo.delete(pedido.idEstudio);
                              return nuevo;
                            });
                          }
                        }}
                        className={`
    flex items-center gap-3
    text-base font-bold uppercase tracking-wider
    px-8 py-2 rounded-lg
    transition-all
    ${
      pedido.realizado || estaProcesando
        ? `bg-slate-300 text-slate-700 cursor-not-allowed border border-slate-300`
        : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md hover:shadow-lg active:scale-95"
    }
  `}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {pedido.realizado
                          ? "Ya Finalizado"
                          : estaProcesando
                            ? "Procesando..."
                            : "Finalizar Estudio"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pedidos.length > 0 && (
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
                  // Opcional: Mostrar nombre del paciente interno para confirmar visualmente
                  // subtitle={`Vinculado a: ${pacienteInterno.nombre}`}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
