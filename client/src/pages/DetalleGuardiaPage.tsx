import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Baby,
  Loader2,
  Save,
  UserX,
  RefreshCw,
  FileText,
  Activity,
  ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { IPedidoGuardia } from "@/types/pedidos";
import {
  capitalize,
  esTomografia,
  getUrlFormularioTomografia,
} from "@/components/pedidos/utils";
import { useAuth } from "@/context/AuthContext";
import { useConsumos } from "@/hooks/useConsumos";
import { PanelConsumos } from "@/components/pedidos/PanelConsumos";
import { PanelPacienteEncontrado } from "@/components/pedidos/PanelPacienteEncontrado";
import { EstudioDetalleRow } from "@/components/pedidos/EstudioDetalleRow";
import { EstudioCardMobile } from "@/components/pedidos/EstudioCardMobile";
import { toast } from "sonner";
import { formatearDni, dniAString } from "@/utils/dni";
import {
  getEstadoPedido,
  esPedidoActivo,
  parseFechaPedido,
} from "@/utils/pedidos";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";
import { GuardiaService } from "@/services/guardia.service";

export default function DetalleGuardiaPage() {
  const { dni } = useParams<{ dni: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const pedidoGeneral =
    (location.state?.pedidoGeneral as IPedidoGuardia | undefined) ?? null;

  const {
    pacienteGuardia,
    pedidosPaciente,
    loadingPedidosPaciente,
    buscarPacienteGuardia,
    buscarPedidosPaciente,
    transferirPedido,
  } = useServicioGuardia();

  const ID_COBERTURA_PARTICULAR = "09999";
  const SISTEMA_GUARDIA = "guardia";

  const [dniPaciente, setDniPaciente] = useState("");
  const [dniBuscado, setDniBuscado] = useState("");
  const [procesando, setProcesando] = useState<Set<string>>(new Set());
  const [coberturaSeleccionada, setCoberturaSeleccionada] = useState("");
  const [filtroPractica, setFiltroPractica] = useState("todos");
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  const { user } = useAuth();
  const tecnico = user
    ? `${capitalize(user.apellido)}, ${capitalize(user.nombre)}`
    : "";

  const pedidosActivos = useMemo(
    () => pedidosPaciente.filter(esPedidoActivo),
    [pedidosPaciente],
  );

  const pedidosTomografiaActivos = useMemo(
    () => pedidosActivos.filter((p) => esTomografia(p.tipoEstudio)),
    [pedidosActivos],
  );

  const mostrarRegistrarTomografia =
    pedidosTomografiaActivos.length > 0 && Boolean(pacienteGuardia);

  const urlFormularioTomografia = mostrarRegistrarTomografia
    ? getUrlFormularioTomografia(
        {
          nombre: `${pacienteGuardia!.apellido}, ${pacienteGuardia!.nombres}`,
          dni: pacienteGuardia!.dniString,
          sala: "",
          diagnostico: pedidosTomografiaActivos[0]?.diagnostico ?? "",
          servicio: "GUARDIA GENERAL",
        },
        tecnico,
        "Guardia",
      )
    : "";

  const tiposPractica = useMemo(
    () => Array.from(new Set(pedidosPaciente.map((p) => p.tipoEstudio))).sort(),
    [pedidosPaciente],
  );

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
    idEstudiosEnviados,
  } = useConsumos(pedidosActivos, "GUARDIA");

  /* ====== Validación de acceso ====== */
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await GuardiaService.checkHsiSession();
        if (!res.hasSession) {
          navigate("/guardia", { replace: true });
          return;
        }
        if (!dni) {
          navigate("/guardia", { replace: true });
          return;
        }
        setVerificandoSesion(false);
        setFiltroPractica("todos");
        buscarPacienteGuardia(dni);
        buscarPedidosPaciente(dni);
      } catch {
        navigate("/guardia", { replace: true });
      }
    };
    verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dni]);

  /* ====== Dato DNI para la imputación ====== */
  useEffect(() => {
    if (pacienteGuardia?.dni) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDniPaciente(dniAString(pacienteGuardia.dni));
    }
  }, [pacienteGuardia]);

  useEffect(() => {
    if (dniPaciente.length >= 7 && dniPaciente !== dniBuscado) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDniBuscado(dniPaciente);
      buscarPacienteInterno(dniPaciente);
    }
  }, [dniPaciente, dniBuscado, buscarPacienteInterno]);

  const handleTransferir = async (idEstudio: string) => {
    setProcesando((prev) => new Set(prev).add(idEstudio));
    try {
      await transferirPedido(idEstudio);
    } catch {
      // error handled by hook toast
    } finally {
      setProcesando((prev) => {
        const nuevo = new Set(prev);
        nuevo.delete(idEstudio);
        return nuevo;
      });
    }
  };

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

  const reintentarBusqueda = () => {
    buscarPacienteInterno(dniPaciente);
  };

  const PRIORIDAD_ESTADO = { activo: 0, antiguo: 1, realizado: 2 } as const;

  const pedidosOrdenados = [...pedidosPaciente]
    .filter(
      (p) => filtroPractica === "todos" || p.tipoEstudio === filtroPractica,
    )
    .sort((a, b) => {
      const pa = PRIORIDAD_ESTADO[getEstadoPedido(a)];
      const pb = PRIORIDAD_ESTADO[getEstadoPedido(b)];
      if (pa !== pb) return pa - pb;
      return (
        (parseFechaPedido(b.fecha)?.getTime() ?? 0) -
        (parseFechaPedido(a.fecha)?.getTime() ?? 0)
      );
    });

  if (verificandoSesion) {
    return (
      <div className="bg-seccion-guardia min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-white font-bold">
            Verificando sesión HSI...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-seccion-guardia min-h-screen flex flex-col font-sans">
      {/* HEADER STICKY */}
      <div className="sticky top-16 z-10 shrink-0">
        <div className="p-4 md:p-6 pb-0">
          <div className="w-full mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center gap-3 bg-red-900/90 dark:bg-red-950/85 backdrop-blur-sm p-3 rounded-xl border border-white/20">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Volver a Guardia"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-1 pr-2 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-lg lg:text-xl font-black text-white tracking-tight leading-none truncate">
                    {pacienteGuardia
                      ? `${pacienteGuardia.apellido}, ${capitalize(pacienteGuardia.nombres)}`
                      : "Cargando paciente..."}
                  </h1>

                  <div className="flex items-center gap-1.5 bg-red-100/20 text-white px-3 py-1 rounded-full border border-white/20 w-fit">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">
                      {pedidoGeneral?.ubicacion || "Guardia"}
                    </span>
                  </div>

                  {mostrarRegistrarTomografia && (
                    <a
                      href={urlFormularioTomografia}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Se abre en una pestaña nueva"
                      className="flex items-center justify-center gap-2 h-8 px-3 rounded-full border-2 border-teal-300/60 bg-teal-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:bg-teal-800 active:scale-95 w-fit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Registrar Tomografía
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 font-medium border-t border-white/10 pt-1.5">
                  {pacienteGuardia ? (
                    <>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        DNI:{" "}
                        <strong className="text-white font-bold tracking-wider">
                          {formatearDni(pacienteGuardia.dniString)}
                        </strong>
                      </span>
                      <span className="hidden sm:block w-px h-3 bg-white/20" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Edad:{" "}
                        <strong className="text-white font-bold">
                          {pacienteGuardia.edad} Años
                        </strong>
                      </span>
                      <span className="hidden sm:block w-px h-3 bg-white/20" />
                      <span className="flex items-center gap-1">
                        <Baby className="w-3.5 h-3.5" />
                        Nacimiento:{" "}
                        <strong className="text-white/90 font-bold">
                          {pacienteGuardia.fechaNacimientoString}
                        </strong>
                      </span>
                    </>
                  ) : (
                    <span className="animate-pulse">
                      Cargando datos del paciente...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 p-4 md:p-6">
        <div className="w-full mx-auto max-w-7xl lg:max-w-[88rem] flex flex-col lg:flex-row lg:items-start gap-6">
          {/* COLUMNA IZQUIERDA: Listado de Pedidos */}
          <div className="w-full lg:w-[60%] xl:w-[65%] bg-card rounded-xl border border-border shadow-sm p-4 lg:p-6">
            <div className="mb-6 flex items-center gap-2 text-muted-foreground uppercase tracking-widest font-black text-sm">
              <FileText className="w-5 h-5 text-indigo-400" />
              Estudios Solicitados
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tipo de práctica
              </label>
              <select
                value={filtroPractica}
                onChange={(e) => setFiltroPractica(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="todos">Todos</option>
                {tiposPractica.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {filtroPractica !== "todos" && (
                <span className="text-xs text-muted-foreground font-medium">
                  {pedidosOrdenados.length}{" "}
                  {pedidosOrdenados.length === 1 ? "estudio" : "estudios"}
                </span>
              )}
            </div>

            {loadingPedidosPaciente ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                <span className="text-lg font-medium text-muted-foreground">
                  Cargando pedidos del paciente...
                </span>
              </div>
            ) : pedidosOrdenados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
                <FileText className="w-24 h-24 mb-4 stroke-1" />
                <p className="text-xl font-medium">No hay pedidos pendientes</p>
              </div>
            ) : (
              <>
                {/* Desktop: tabla compacta */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-red-900 dark:bg-red-950 text-white uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-bold text-center">
                          Fecha
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          Estudio
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          Diagnóstico / Solicitante
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pedidosOrdenados.map((pedido) => (
                        <EstudioDetalleRow
                          key={pedido.idEstudio}
                          pedido={pedido}
                          estado={getEstadoPedido(pedido)}
                          procesando={procesando.has(pedido.idEstudio)}
                          onTransferir={handleTransferir}
                          consumoEnviado={idEstudiosEnviados.has(
                            pedido.idEstudio,
                          )}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: tarjetas */}
                <div className="lg:hidden grid grid-cols-1 gap-4">
                  {pedidosOrdenados.map((pedido) => (
                    <EstudioCardMobile
                      key={pedido.idEstudio}
                      pedido={pedido}
                      estado={getEstadoPedido(pedido)}
                      procesando={procesando.has(pedido.idEstudio)}
                      onTransferir={handleTransferir}
                      consumoEnviado={idEstudiosEnviados.has(pedido.idEstudio)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* COLUMNA DERECHA: Imputación de Consumos */}
          <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-3 border-b border-border bg-card flex-shrink-0">
              <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest font-black text-sm">
                <Activity className="w-5 h-5 text-indigo-400" />
                Carga de Materiales
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Imputación directa a Worklist
              </p>
            </div>

            <div className="flex-grow p-4 flex flex-col gap-4">
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
                      Este DNI no registra ingreso en el sistema administrativo
                      central.
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
  );
}
