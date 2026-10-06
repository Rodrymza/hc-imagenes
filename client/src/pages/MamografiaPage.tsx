import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MamografiaService } from "@/services/mamografia.service";
import type {
  IAnamnesis,
  IEstudioDetalle,
  IEstudioPayload,
  IHallazgoPayload,
  IHistorialPaciente,
  OrigenEnum as OrigenTipo,
  TurnoEnum as TurnoTipo,
} from "@/types/mamografia";
import {
  MamaEnum,
  OrigenEnum,
  TipoEstudioEnum,
  TIPOS_ESTUDIO,
  TurnoEnum,
} from "@/types/mamografia";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  RotateCcw,
  Table2,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useAuth } from "@/context/AuthContext";
import { SelectorCuadrantes } from "@/components/mamografia/SelectorCuadrantes";
import { ModalHallazgo } from "@/components/mamografia/ModalHallazgo";
import { HistorialEstudios } from "@/components/mamografia/HistorialEstudios";
import { DetalleEstudio } from "@/components/mamografia/DetalleEstudio";
import { FichaPacienteEditable } from "@/components/mamografia/FichaPacienteEditable";
import { FormAnamnesis } from "@/components/mamografia/FormAnamnesis";
import { EstadisticasMamografia } from "@/components/mamografia/EstadisticasMamografia";
import { RegistrosMamografia } from "@/components/mamografia/RegistrosMamografia";
import { IdentificacionPaciente } from "@/components/mamografia/IdentificacionPaciente";

const hoyISO = () => new Date().toISOString().slice(0, 10);
const keyFor = (mama: MamaEnum, cuadrante: string) => `${mama}|${cuadrante}`;

const calcularTurnoActual = (): TurnoTipo => {
  const hora = new Date().getHours();
  return hora >= 8 && hora < 14 ? TurnoEnum.MANANA : TurnoEnum.TARDE;
};

const ES_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

const KEYS_ANAMNESIS_PRELLENAR: (keyof IAnamnesis)[] = [
  "menarca",
  "fecha_ultima_menstruacion",
  "edad_primer_hijo",
  "cantidad_hijos",
  "lactancia",
  "terapia_reemplazo_hormonal",
  "anticonceptivos_orales",
  "antecedentes_quirurgicos_mamarios",
  "antecedentes_quirurgicos_generales",
  "antecedentes_oncologicos",
  "radioterapia",
  "quimioterapia",
  "antecedentes_heredofamiliares",
];

const anamnesisDesdeHistorial = (h: IHistorialPaciente): IAnamnesis => {
  const estudio = h.estudios.find((e) =>
    KEYS_ANAMNESIS_PRELLENAR.some((k) => e[k] && String(e[k]).trim() !== ""),
  );
  if (!estudio) return {};

  const prellenado: IAnamnesis = {};
  for (const k of KEYS_ANAMNESIS_PRELLENAR) {
    const valor = estudio[k];
    if (
      k === "fecha_ultima_menstruacion" &&
      valor &&
      !ES_FECHA_ISO.test(valor)
    ) {
      continue;
    }
    if (valor && String(valor).trim() !== "") {
      prellenado[k] = valor;
    }
  }
  return prellenado;
};

const INPUT_CLASS =
  "w-fit px-3 py-2 border border-input bg-card rounded-lg text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent";

const LABEL_CLASS =
  "block text-[11px] font-bold text-foreground/80 m-2 uppercase tracking-wide";

export default function MamografiaPage() {
  const { isAdminMode, user } = useAuth();
  const esMedico = user?.rol === "MEDICO";
  const puedeEliminar = isAdminMode || user?.rol === "MAMO";
  const [tab, setTab] = useState<"registro" | "estudios" | "estadisticas">(
    esMedico ? "estudios" : "registro",
  );
  const [dni, setDni] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [errorManual, setErrorManual] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [historial, setHistorial] = useState<IHistorialPaciente | null>(null);

  const [pacienteNombre, setPacienteNombre] = useState("");
  const [pacienteApellido, setPacienteApellido] = useState("");
  const [pacienteFechaNac, setPacienteFechaNac] = useState("");

  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [domicilio, setDomicilio] = useState("");

  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [guardandoManual, setGuardandoManual] = useState(false);

  const [fechaEstudio, setFechaEstudio] = useState(hoyISO());
  const [turno, setTurno] = useState<TurnoTipo>(calcularTurnoActual);
  const [turnoManual, setTurnoManual] = useState(false);
  const [origen, setOrigen] = useState<OrigenTipo>(OrigenEnum.CE);
  const [tipoEstudio, setTipoEstudio] = useState<TipoEstudioEnum>(
    TipoEstudioEnum.SCREENING_BILATERAL,
  );
  const [anamnesis, setAnamnesis] = useState<IAnamnesis>({});
  const [prellenadoAnamnesis, setPrellenadoAnamnesis] = useState(false);
  const [hallazgos, setHallazgos] = useState<Record<string, IHallazgoPayload>>(
    {},
  );
  const [modal, setModal] = useState<{
    mama: MamaEnum;
    cuadrante: string;
  } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [detalleEstudio, setDetalleEstudio] = useState<{
    estudio: IEstudioDetalle | null;
    mostrarDatosPaciente: boolean;
  }>({ estudio: null, mostrarDatosPaciente: false });
  const [eliminandoEstudio, setEliminandoEstudio] = useState(false);

  useEffect(() => {
    const actualizarTurno = () => {
      setTurno((prev) => (turnoManual ? prev : calcularTurnoActual()));
    };
    actualizarTurno();
    const interval = setInterval(actualizarTurno, 30_000);
    return () => clearInterval(interval);
  }, [turnoManual]);

  const aplicarHistorial = (h: IHistorialPaciente, profesional?: string) => {
    setHistorial(h);
    setPacienteNombre(h.paciente.nombre);
    setPacienteApellido(h.paciente.apellido);
    setPacienteFechaNac(h.paciente.fecha_nacimiento ?? "");
    setTelefono(h.paciente.telefono ?? "");
    setEmail(h.paciente.email ?? "");
    setDomicilio(h.paciente.domicilio ?? "");
    setFechaEstudio(hoyISO());
    setTurno(calcularTurnoActual());
    setTurnoManual(false);
    const anamnesisPre = anamnesisDesdeHistorial(h);
    setAnamnesis(anamnesisPre);
    setPrellenadoAnamnesis(Object.keys(anamnesisPre).length > 0);
    setHallazgos({});
    setErrorBusqueda(null);
    setErrorManual(null);
    if (profesional) toast.success(profesional);
  };

  const buscar = () => {
    const dniValido = dni.trim();
    if (dniValido.length < 6) {
      setErrorBusqueda("Ingresá un DNI válido (mínimo 6 dígitos).");
      return;
    }
    setErrorBusqueda(null);
    setErrorManual(null);

    const controller = new AbortController();
    abortRef.current = controller;
    setBuscando(true);

    MamografiaService.buscarPaciente(dniValido, controller.signal)
      .then((h) => {
        aplicarHistorial(
          h,
          h.origen === "local"
            ? `Paciente encontrada en el registro local (${h.estudios.length} estudio${h.estudios.length === 1 ? "" : "s"})`
            : "Paciente cargada desde el Sistema Central",
        );
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        setErrorBusqueda(
          (error as { response?: { status?: number } })?.response?.status ===
            404
            ? "No figura en el sistema central."
            : "Sin conexión con el sistema central.",
        );
      })
      .finally(() => setBuscando(false));
  };

  const cancelarBusqueda = () => {
    abortRef.current?.abort();
    setBuscando(false);
  };

  const irADatos = () => {
    document
      .getElementById("datos-paciente")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const crearPacienteManual = async () => {
    const dniValido = dni.trim();
    if (dniValido.length < 6) {
      setErrorManual("Ingresá un DNI válido en la identificación.");
      return;
    }
    if (!pacienteNombre.trim() || !pacienteApellido.trim()) {
      setErrorManual("Completá nombre y apellido.");
      return;
    }

    setGuardandoManual(true);
    try {
      const h = await MamografiaService.crearPacienteManual({
        dni: dniValido,
        nombre: pacienteNombre.trim(),
        apellido: pacienteApellido.trim(),
        fecha_nacimiento: pacienteFechaNac || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        domicilio: domicilio.trim() || null,
      });
      aplicarHistorial(h, "Paciente cargada manualmente");
    } catch (error) {
      setErrorManual(getErrorMessage(error));
    } finally {
      setGuardandoManual(false);
    }
  };

  const guardarDatosPaciente = async () => {
    if (!historial) return;
    setGuardandoDatos(true);
    try {
      const res = await MamografiaService.actualizarPaciente(
        historial.paciente.id,
        {
          nombre: pacienteNombre.trim(),
          apellido: pacienteApellido.trim(),
          fecha_nacimiento: pacienteFechaNac || null,
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          domicilio: domicilio.trim() || null,
        },
      );
      setHistorial((prev) =>
        prev ? { ...prev, paciente: res.paciente } : prev,
      );
      setTelefono(res.paciente.telefono ?? "");
      setEmail(res.paciente.email ?? "");
      setDomicilio(res.paciente.domicilio ?? "");
      toast.success("Datos de la paciente actualizados");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setGuardandoDatos(false);
    }
  };

  const cambiarPaciente = () => {
    setHistorial(null);
    setPacienteNombre("");
    setDni("");
    setPacienteApellido("");
    setPacienteFechaNac("");
    setTelefono("");
    setEmail("");
    setDomicilio("");
    setTurno(calcularTurnoActual());
    setTurnoManual(false);
    setFechaEstudio(hoyISO());
    setAnamnesis({});
    setPrellenadoAnamnesis(false);
    setHallazgos({});
    setErrorBusqueda(null);
    setErrorManual(null);
  };

  const guardarHallazgo = (hallazgo: IHallazgoPayload) => {
    setHallazgos((prev) => ({
      ...prev,
      [keyFor(hallazgo.mama, hallazgo.cuadrante)]: hallazgo,
    }));
    setModal(null);
  };

  const eliminarHallazgo = () => {
    if (!modal) return;
    setHallazgos((prev) => {
      const next = { ...prev };
      delete next[keyFor(modal.mama, modal.cuadrante)];
      return next;
    });
    setModal(null);
  };

  const verDetalleDesdeHistorial = (
    estudio: IHistorialPaciente["estudios"][number],
  ) => {
    if (!historial) return;
    setDetalleEstudio({
      estudio: { ...estudio, paciente: historial.paciente },
      mostrarDatosPaciente: false,
    });
  };

  const eliminarEstudioDesdeDetalle = async () => {
    const estudio = detalleEstudio.estudio;
    if (!estudio) return;
    setEliminandoEstudio(true);
    try {
      const res = await MamografiaService.eliminarEstudio(estudio.id);
      toast.success(res.message);
      setDetalleEstudio({ estudio: null, mostrarDatosPaciente: false });
      if (historial) {
        const h = await MamografiaService.getHistorial(historial.paciente.id);
        setHistorial(h);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEliminandoEstudio(false);
    }
  };

  const guardarEstudio = async () => {
    if (!historial) return;

    const anamnesisLimpio: IAnamnesis = {};
    for (const [k, v] of Object.entries(anamnesis)) {
      if (v && String(v).trim() !== "")
        anamnesisLimpio[k as keyof IAnamnesis] = v;
    }

    const payload: IEstudioPayload = {
      dni: historial.paciente.dni,
      fecha_estudio: fechaEstudio || undefined,
      turno: turno,
      origen,
      tipo_estudio: tipoEstudio,
      anamnesis: anamnesisLimpio,
      contacto: {
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        domicilio: domicilio.trim() || null,
      },
      hallazgos: Object.values(hallazgos),
    };

    setGuardando(true);
    try {
      const res = await MamografiaService.crearEstudio(payload);
      toast.success(res.message);
      const h = await MamografiaService.getHistorial(historial.paciente.id);
      setHistorial(h);
      setTelefono(h.paciente.telefono ?? "");
      setEmail(h.paciente.email ?? "");
      setDomicilio(h.paciente.domicilio ?? "");
      setFechaEstudio(hoyISO());
      setAnamnesis({});
      setPrellenadoAnamnesis(false);
      setHallazgos({});
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setGuardando(false);
    }
  };

  const modalInicial = modal
    ? hallazgos[keyFor(modal.mama, modal.cuadrante)]
    : undefined;

  const modalKey = modal ? keyFor(modal.mama, modal.cuadrante) : "modal";

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-500 pb-10">
      <div className="bg-seccion-mamografia h-1.5" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-foreground uppercase mb-4 flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-rose-500 dark:text-rose-400" />
            </span>
            Servicio de Mamografía
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {!esMedico && (
              <button
                type="button"
                onClick={() => setTab("registro")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                  tab === "registro"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <FilePlus2 className="h-4 w-4" /> Registro
              </button>
            )}
            <button
              type="button"
              onClick={() => setTab("estudios")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                tab === "estudios"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table2 className="h-4 w-4" /> Estudios
            </button>
            <button
              type="button"
              onClick={() => setTab("estadisticas")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                tab === "estadisticas"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Estadísticas
            </button>
          </div>
        </header>

        {tab === "estadisticas" ? (
          <EstadisticasMamografia />
        ) : tab === "estudios" ? (
          <RegistrosMamografia />
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <IdentificacionPaciente
              dni={dni}
              onDniChange={setDni}
              buscando={buscando}
              onBuscar={buscar}
              onCancelar={cancelarBusqueda}
              errorBusqueda={errorBusqueda}
              onIrADatos={irADatos}
              paciente={historial?.paciente ?? null}
              onCambiarPaciente={cambiarPaciente}
            />

            {!historial && (
              <p className="text-xs font-bold text-muted-foreground/70">
                Cargá la paciente para habilitar el registro del estudio.
              </p>
            )}

            {/* Datos de la paciente (siempre visible) */}
            <FichaPacienteEditable
              nombre={pacienteNombre}
              apellido={pacienteApellido}
              fechaNacimiento={pacienteFechaNac}
              onNombreChange={setPacienteNombre}
              onApellidoChange={setPacienteApellido}
              onFechaNacimientoChange={setPacienteFechaNac}
              telefono={telefono}
              email={email}
              domicilio={domicilio}
              onTelefonoChange={setTelefono}
              onEmailChange={setEmail}
              onDomicilioChange={setDomicilio}
              pacienteCargada={Boolean(historial)}
              dni={historial?.paciente.dni}
              guardando={guardandoDatos}
              guardandoManual={guardandoManual}
              error={errorManual}
              onGuardarDatos={guardarDatosPaciente}
              onRegistrarManual={crearPacienteManual}
            />

            <fieldset disabled={!historial} className="space-y-5 min-w-0">
              {/* Datos operativos del estudio */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-4">
                  Datos del estudio
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="col-span-2 lg:col-span-1">
                    <label className={LABEL_CLASS}>Fecha del estudio</label>
                    <input
                      type="date"
                      value={fechaEstudio}
                      onChange={(e) => setFechaEstudio(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className={LABEL_CLASS}>Turno</label>
                    <select
                      value={turno}
                      onChange={(e) => {
                        setTurno(e.target.value as TurnoTipo);
                        setTurnoManual(true);
                      }}
                      className={INPUT_CLASS}
                    >
                      <option value={TurnoEnum.MANANA}>Mañana</option>
                      <option value={TurnoEnum.TARDE}>Tarde</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="col-span-2 lg:col-span-1">
                    <label className={LABEL_CLASS}>Origen</label>
                    <select
                      value={origen}
                      onChange={(e) => setOrigen(e.target.value as OrigenTipo)}
                      className={INPUT_CLASS}
                    >
                      <option value={OrigenEnum.CE}>Consultorio Externo</option>
                      <option value={OrigenEnum.INTERNADO}>Internado</option>
                    </select>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <label className={LABEL_CLASS}>Tipo de estudio</label>
                    <select
                      value={tipoEstudio}
                      onChange={(e) =>
                        setTipoEstudio(e.target.value as TipoEstudioEnum)
                      }
                      className={INPUT_CLASS}
                      title={tipoEstudio}
                    >
                      {TIPOS_ESTUDIO.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Anamnesis */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                    Anamnesis
                  </h3>
                  {prellenadoAnamnesis && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnamnesis({});
                        setPrellenadoAnamnesis(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                      title="Descarta los datos copiados del último estudio"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Limpiar
                    </button>
                  )}
                </div>
                {prellenadoAnamnesis && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Datos copiados del último estudio. Modificalos solo si hace
                    falta.
                  </p>
                )}
                <FormAnamnesis value={anamnesis} onChange={setAnamnesis} />
              </div>

              {/* Hallazgos por cuadrante */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-4">
                  Hallazgos por cuadrante
                </h3>
                <SelectorCuadrantes
                  hallazgos={hallazgos}
                  onSeleccionar={(mama, cuadrante) =>
                    setModal({ mama, cuadrante })
                  }
                />
              </div>
            </fieldset>

            {/* Guardar estudio */}
            <div className="sticky bottom-4 z-10 flex justify-end">
              <button
                onClick={guardarEstudio}
                disabled={!historial || guardando}
                className="flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 disabled:bg-muted disabled:text-muted-foreground rounded-2xl transition-all shadow-xl shadow-rose-200 dark:shadow-none active:scale-95"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FilePlus2 className="h-5 w-5" />
                )}
                Guardar estudio
              </button>
            </div>

            {historial && (
              /* Historial */
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-4">
                  Historial de estudios
                </h3>
                <HistorialEstudios
                  estudios={historial.estudios}
                  onVerDetalle={verDetalleDesdeHistorial}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <ModalHallazgo
          key={modalKey}
          mama={modal.mama}
          cuadrante={modal.cuadrante}
          inicial={modalInicial}
          onClose={() => setModal(null)}
          onGuardar={guardarHallazgo}
          onEliminar={eliminarHallazgo}
        />
      )}

      {detalleEstudio.estudio && (
        <DetalleEstudio
          estudio={detalleEstudio.estudio}
          mostrarDatosPaciente={detalleEstudio.mostrarDatosPaciente}
          onEliminar={puedeEliminar ? eliminarEstudioDesdeDetalle : undefined}
          eliminando={eliminandoEstudio}
          onClose={() =>
            setDetalleEstudio({ estudio: null, mostrarDatosPaciente: false })
          }
        />
      )}
    </div>
  );
}
