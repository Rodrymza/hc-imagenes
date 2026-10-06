import type { IEstudioDetalle } from "@/types/mamografia";
import { OrigenEnum } from "@/types/mamografia";
import { ANAMNESIS_LABELS } from "./anamnesisLabels";
import {
  CalendarDays,
  ClipboardList,
  Hospital,
  Phone,
  Stethoscope,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { capitalize } from "../pedidos/utils";
import { useState } from "react";

interface Props {
  estudio: IEstudioDetalle | null;
  cargando?: boolean;
  mostrarDatosPaciente?: boolean;
  onEliminar?: () => void;
  eliminando?: boolean;
  onClose: () => void;
}

const formatearFecha = (fecha: string): string => {
  if (!fecha) return "-";
  const [anio, mes, dia] = fecha.split("-");
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
};

const dato = (valor: string | null | undefined): string => valor || "-";

const calcularEdad = (
  fechaNacimiento: string,
  fechaEstudio: string,
): number | null => {
  const [anioNac, mesNac, diaNac] = fechaNacimiento.split("-").map(Number);
  const [anioEst, mesEst, diaEst] = fechaEstudio.split("-").map(Number);
  let edad = anioEst - anioNac;
  if (mesEst < mesNac || (mesEst === mesNac && diaEst < diaNac)) edad--;
  return edad;
};

export function DetalleEstudio({
  estudio,
  cargando = false,
  mostrarDatosPaciente = false,
  onEliminar,
  eliminando = false,
  onClose,
}: Props) {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const anamnesisConDatos = estudio
    ? ANAMNESIS_LABELS.filter((f) => estudio[f.key])
    : [];

  const cancelarEliminar = () => {
    if (eliminando) return;
    setConfirmandoEliminar(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={eliminando ? undefined : onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-wide">
                Detalle del estudio
              </h2>
              {estudio && (
                <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase">
                  {estudio.tipo_estudio}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={eliminando ? undefined : onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {cargando ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wide">
                Cargando estudio...
              </p>
            </div>
          ) : !estudio ? null : (
            <>
              {mostrarDatosPaciente && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
                    <UserRound className="h-4 w-4" /> Paciente
                  </h3>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                    <p className="text-sm font-black text-foreground">
                      {capitalize(estudio.paciente.apellido)},{" "}
                      {capitalize(estudio.paciente.nombre)}
                    </p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground font-bold">DNI</dt>
                        <dd className="text-foreground font-semibold">
                          {estudio.paciente.dni}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground font-bold">
                          Nacimiento
                        </dt>
                        <dd className="text-foreground font-semibold">
                          {estudio.paciente.fecha_nacimiento
                            ? `${formatearFecha(estudio.paciente.fecha_nacimiento)} (${calcularEdad(estudio.paciente.fecha_nacimiento, estudio.fecha_estudio)} años)`
                            : "-"}
                        </dd>
                      </div>
                      {estudio.paciente.telefono && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground font-bold">
                            Teléfono
                          </dt>
                          <dd className="text-foreground font-semibold">
                            {estudio.paciente.telefono}
                          </dd>
                        </div>
                      )}
                      {estudio.paciente.email && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground font-bold">
                            Email
                          </dt>
                          <dd className="text-foreground font-semibold break-all text-right">
                            {estudio.paciente.email}
                          </dd>
                        </div>
                      )}
                      {estudio.paciente.domicilio && (
                        <div className="flex justify-between gap-2 sm:col-span-2">
                          <dt className="text-muted-foreground font-bold">
                            Domicilio
                          </dt>
                          <dd className="text-foreground font-semibold text-right">
                            {estudio.paciente.domicilio}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Datos del estudio
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground font-bold">Fecha</dt>
                    <dd className="text-foreground font-semibold">
                      {formatearFecha(estudio.fecha_estudio)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground font-bold">
                      N° de estudio
                    </dt>
                    <dd className="text-foreground font-semibold">
                      {estudio.numero_estudio ?? "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground font-bold">Turno</dt>
                    <dd className="text-foreground font-semibold">
                      {estudio.turno ?? "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground font-bold">Origen</dt>
                    <dd>
                      <span
                        className={`text-xs font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                          estudio.origen === OrigenEnum.INTERNADO
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {estudio.origen}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 col-span-1 sm:col-span-2">
                    <dt className="text-muted-foreground font-bold">
                      Tipo de estudio
                    </dt>
                    <dd className="text-foreground font-semibold text-right">
                      {estudio.tipo_estudio}
                    </dd>
                  </div>
                  {estudio.registrado_por && (
                    <div className="flex justify-between gap-2 col-span-1 sm:col-span-2">
                      <dt className="text-muted-foreground font-bold">
                        Registrado por
                      </dt>
                      <dd className="text-foreground font-semibold text-right">
                        {estudio.registrado_por}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" /> Hallazgos
                </h3>
                {estudio.hallazgos.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Sin hallazgos registrados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {estudio.hallazgos.map((h) => (
                      <li
                        key={h.id}
                        className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-2"
                      >
                        <p className="text-[11px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
                          {h.mama} · {h.cuadrante}
                        </p>
                        {h.tipo_hallazgo && (
                          <p className="text-sm font-bold text-foreground">
                            {h.tipo_hallazgo}
                          </p>
                        )}
                        {h.observaciones && (
                          <p className="text-xs text-muted-foreground">
                            {h.observaciones}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {anamnesisConDatos.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Hospital className="h-4 w-4" /> Anamnesis
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {anamnesisConDatos.map((f) => (
                      <div
                        key={f.key}
                        className="flex justify-between gap-2 text-xs"
                      >
                        <dt className="text-muted-foreground font-bold">
                          {f.label}
                        </dt>
                        <dd className="text-foreground font-semibold text-right">
                          {String(estudio[f.key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </>
          )}
        </div>

        {estudio && !cargando && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
            {mostrarDatosPaciente && (
              <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Tel: {dato(estudio.paciente.telefono)}
              </p>
            )}
            <div className="flex-1" />
            {onEliminar &&
              (confirmandoEliminar ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    ¿Eliminar este estudio?
                  </span>
                  <button
                    type="button"
                    onClick={cancelarEliminar}
                    disabled={eliminando}
                    className="px-3 py-2 text-xs font-black uppercase tracking-wide text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onEliminar}
                    disabled={eliminando}
                    className="px-3 py-2 text-xs font-black uppercase tracking-wide text-white bg-red-500 hover:bg-red-600 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-all active:scale-95"
                  >
                    {eliminando ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoEliminar(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              ))}
            <button
              type="button"
              onClick={onClose}
              disabled={eliminando}
              className="px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-none active:scale-95"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
