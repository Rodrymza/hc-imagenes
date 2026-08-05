import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { X, Bell, BellOff, Clock, CalendarDays, ShieldOff } from "lucide-react";
import {
  InternacionService,
  type INotificacionesConfig,
} from "@/services/internacion.service";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ConfigNotificacionesPanel({ open, onClose }: Props) {
  const [config, setConfig] = useState<INotificacionesConfig>({
    ENVIOS_DESACTIVADOS: true,
    HORA_INICIO: 8,
    HORA_FIN: 14,
    EXCLUIR_TERAPIAS: false,
    DIAS_PERMITIDOS: [1, 2, 3, 4, 5],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setLoading(true);
      InternacionService.getConfigNotificaciones()
        .then(setConfig)
        .catch((err) => toast.error(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }
    prevOpen.current = open;
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result =
        await InternacionService.updateConfigNotificaciones(config);
      setConfig(result.config);
      toast.success("Configuración de notificaciones actualizada");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-800">
              Config. Notificaciones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-10 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Toggle: Enviar notificaciones */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.ENVIOS_DESACTIVADOS ? (
                  <BellOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Bell className="h-4 w-4 text-emerald-600" />
                )}
                <span className="text-sm font-bold text-slate-700">
                  Enviar notificaciones Telegram
                </span>
              </div>
              <button
                onClick={() =>
                  setConfig((c) => ({
                    ...c,
                    ENVIOS_DESACTIVADOS: !c.ENVIOS_DESACTIVADOS,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.ENVIOS_DESACTIVADOS ? "bg-slate-300" : "bg-emerald-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.ENVIOS_DESACTIVADOS
                      ? "translate-x-1"
                      : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            {/* Horario */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  Horario de notificación
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Desde
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={config.HORA_INICIO}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        HORA_INICIO: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <span className="text-slate-400 font-bold mt-5">a</span>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Hasta
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={config.HORA_FIN}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        HORA_FIN: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Días de notificación */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  Días de notificación
                </span>
              </div>
              <div className="flex gap-2">
                {(["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"] as const).map(
                  (dia, i) => {
                    const activo = config.DIAS_PERMITIDOS.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setConfig((c) => ({
                            ...c,
                            DIAS_PERMITIDOS: activo
                              ? c.DIAS_PERMITIDOS.filter((d) => d !== i)
                              : [...c.DIAS_PERMITIDOS, i].sort(),
                          }))
                        }
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          activo
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {dia}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Toggle: Excluir terapias */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldOff className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  Excluir terapias (salas 445, 441, 417, 470)
                </span>
              </div>
              <button
                onClick={() =>
                  setConfig((c) => ({
                    ...c,
                    EXCLUIR_TERAPIAS: !c.EXCLUIR_TERAPIAS,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.EXCLUIR_TERAPIAS ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.EXCLUIR_TERAPIAS ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
