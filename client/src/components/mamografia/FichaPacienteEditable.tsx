import { dniAString } from "@/utils/dni";
import { Fingerprint, Save, UserPlus } from "lucide-react";

interface Props {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  onNombreChange: (v: string) => void;
  onApellidoChange: (v: string) => void;
  onFechaNacimientoChange: (v: string) => void;
  telefono: string;
  email: string;
  domicilio: string;
  onTelefonoChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onDomicilioChange: (v: string) => void;
  pacienteCargada: boolean;
  dni?: string;
  guardando: boolean;
  guardandoManual: boolean;
  error: string | null;
  onGuardarDatos: () => void;
  onRegistrarManual: () => void;
}

const LABEL_CLASS =
  "block text-[11px] font-bold text-foreground/80 mb-1 uppercase tracking-wide";
const INPUT_CLASS =
  "w-full px-3 py-2 border border-input bg-card rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent";

export function FichaPacienteEditable({
  nombre,
  apellido,
  fechaNacimiento,
  onNombreChange,
  onApellidoChange,
  onFechaNacimientoChange,
  telefono,
  email,
  domicilio,
  onTelefonoChange,
  onEmailChange,
  onDomicilioChange,
  pacienteCargada,
  dni,
  guardando,
  guardandoManual,
  error,
  onGuardarDatos,
  onRegistrarManual,
}: Props) {
  return (
    <div
      id="datos-paciente"
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="h-1 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500" />
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
            <Fingerprint className="h-5 w-5 text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground uppercase leading-tight">
              Datos del paciente
            </p>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {pacienteCargada
                ? `DNI ${dniAString(dni) ?? ""}`
                : "Sin paciente cargada"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Apellido</label>
            <input
              value={apellido}
              onChange={(e) => onApellidoChange(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Nombre</label>
            <input
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Fecha de nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => onFechaNacimientoChange(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Teléfono / WhatsApp</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => onTelefonoChange(e.target.value)}
              placeholder="Ej: 261-5551234"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="paciente@mail.com"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Domicilio</label>
            <input
              value={domicilio}
              onChange={(e) => onDomicilioChange(e.target.value)}
              placeholder="Calle N°, Localidad"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-h-[18px]">
            {error && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>
          {pacienteCargada ? (
            <button
              type="button"
              onClick={onGuardarDatos}
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-600 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-none active:scale-95"
            >
              {guardando ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Guardar datos
            </button>
          ) : (
            <button
              type="button"
              onClick={onRegistrarManual}
              disabled={guardandoManual}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-600 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-none active:scale-95"
            >
              {guardandoManual ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              Registrar paciente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
