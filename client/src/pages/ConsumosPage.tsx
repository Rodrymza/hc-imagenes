import { useEffect, useRef, useState } from "react";
import {
  Search,
  PlusCircle,
  ArrowRight,
  ClipboardList,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useConsumos } from "@/hooks/useConsumos";
import { toast } from "sonner";
import { PanelConsumos } from "@/components/pedidos/PanelConsumos";
import { FichaPaciente } from "@/components/pedidos/FichaPaciente";
import { PedidosGuardiaSection } from "@/components/pedidos/PedidosGuardiaSection";
import { useSearchParams } from "react-router-dom";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";

export default function ConsumosPage() {
  const [coberturaId, setCoberturaId] = useState("");
  const [searchParams] = useSearchParams();
  const dniDesdeUrl = searchParams.get("dni");
  const hcDesdeUrl = searchParams.get("hc");
  const [dniBusqueda, setDniBusqueda] = useState(
    dniDesdeUrl || hcDesdeUrl || "",
  );
  const sistemaUrl = searchParams.get("sistema");
  const [tipoBusqueda, setTipoBusqueda] = useState(hcDesdeUrl ? "hc" : "dni");
  const [sistema, setSistema] = useState<string | null>(sistemaUrl);

  const {
    pedidosPaciente,
    buscarPedidosPaciente,
    buscarPacienteGuardia,
    pacienteGuardia,
    loadingPedidosPaciente,
  } = useServicioGuardia();

  const {
    pacienteInterno,
    buscarPacienteInterno,
    loadingPaciente,
    exposiciones,
    prestaciones,
    agregarExposicion,
    quitarExposicionPorDescripcion,
    confirmarConsumo,
    guardandoConsumos,
  } = useConsumos(pedidosPaciente);

  // Paciente normalizado: une interno y guardia en una shape común para el JSX
  const paciente = pacienteInterno
    ? {
        apellido: pacienteInterno.apellidos,
        nombres: pacienteInterno.nombres,
        historiaClinica: pacienteInterno.idPaciente,
        dniString: pacienteInterno.dniString,
        fechaNacimientoString: pacienteInterno.fechaNacimientoString,
      }
    : pacienteGuardia
      ? {
          apellido: pacienteGuardia.apellido,
          nombres: pacienteGuardia.nombres,
          historiaClinica: String(pacienteGuardia.historiaClinica),
          dniString: pacienteGuardia.dniString,
          fechaNacimientoString: pacienteGuardia.fechaNacimientoString,
        }
      : null;

  // Al montar con URL params, disparar búsquedas de paciente
  useEffect(() => {
    if (dniDesdeUrl) {
      buscarPacienteInterno(dniDesdeUrl, null);
      buscarPacienteGuardia(dniDesdeUrl);
    } else if (hcDesdeUrl) {
      buscarPacienteInterno(null, hcDesdeUrl);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando aparece un DNI válido (del interno o guardia), buscar pedidos una sola vez
  const ultimoDniBuscado = useRef("");

  useEffect(() => {
    const dni = pacienteInterno?.dni || pacienteGuardia?.dni;

    if (dni && dni.length > 5 && dni !== ultimoDniBuscado.current) {
      ultimoDniBuscado.current = dni;
      buscarPedidosPaciente(dni);
    }
  }, [
    pacienteInterno?.dni,
    pacienteGuardia?.dni,
    buscarPedidosPaciente,
  ]);

  const handleBuscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    const valor = dniBusqueda.trim();

    if (valor.length < 3) return toast.error("Ingrese un valor válido");

    ultimoDniBuscado.current = "";

    if (tipoBusqueda === "dni") {
      buscarPacienteInterno(valor, null);
      buscarPacienteGuardia(valor);
    } else {
      buscarPacienteInterno(null, valor);
    }
  };

  const handleFinalizar = async () => {
    // Lógica one-liner de cobertura
    const cobFinal =
      coberturaId || pacienteInterno?.coberturas?.[0]?.idCobertura || "09999";

    if (!pacienteInterno) return toast.error("Debe identificar un paciente");

    if (!sistema) {
      return toast.error("Debes seleccionar un sistema de ingreso");
    }

    await confirmarConsumo(pacienteInterno.idPaciente, cobFinal, sistema);
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 lg:p-8">
      {/* HEADER DE PÁGINA */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-black text-foreground uppercase flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-indigo-600" />
          Registro Manual de Consumos
        </h1>
        <p className="text-muted-foreground text-sm">
          Imputación directa de prestaciones sin pedido electrónico previo.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: IDENTIFICACIÓN (4 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. BÚSQUEDA */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Identificar Paciente
            </h3>
            <form onSubmit={handleBuscar} className="flex gap-2">
              {/* SELECTOR DE TIPO */}
              <select
                value={tipoBusqueda}
                onChange={(e) => setTipoBusqueda(e.target.value)}
                className="bg-muted dark:bg-input/50 border-none rounded-lg px-2 text-[10px] font-black uppercase text-foreground outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="dni">DNI</option>
                <option value="hc">H.C.</option>
              </select>

              <input
                type="number"
                placeholder={
                  tipoBusqueda === "dni" ? "Ingrese DNI..." : "Ingrese HC..."
                }
                className="flex-1 bg-background dark:bg-input/30 border border-input rounded-lg px-4 py-2 text-lg font-bold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={dniBusqueda}
                onChange={(e) => setDniBusqueda(e.target.value)}
              />

              <button
                type="submit"
                disabled={loadingPaciente}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingPaciente ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </form>
          </section>

          {/* 2. FICHA PACIENTE + CONTEXTO */}
          {(pacienteInterno || pacienteGuardia) && paciente && (
            <FichaPaciente
              paciente={paciente}
              sistema={sistema}
              onSistemaChange={setSistema}
              coberturaId={coberturaId}
              onCoberturaChange={setCoberturaId}
              coberturas={pacienteInterno?.coberturas}
            />
          )}
        </div>

        {/* COLUMNA DERECHA: CONSUMOS (7 Cols) */}
        {pacienteInterno && (
          <div className="lg:col-span-7">
            <section className="bg-card rounded-2xl shadow-sm border border-border flex flex-col h-full min-h-[500px]">
              <div className="p-5 border-b border-border flex justify-between items-center">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Detalle de Prestaciones
                </h3>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Carga Manual
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                {/* Aquí reutilizamos el componente PanelConsumos que ya tenemos */}
                {/* Lo ajustamos para que se comporte como el "Cuerpo" de esta tarjeta */}
                <div className="p-2">
                  <PanelConsumos
                    exposiciones={exposiciones}
                    prestaciones={prestaciones}
                    onAdd={agregarExposicion}
                    onRemove={quitarExposicionPorDescripcion}
                    onConfirm={handleFinalizar}
                    isSaving={guardandoConsumos}
                    disabled={!pacienteInterno || !sistema}
                  />
                </div>

                {/* FOOTER INFORMATIVO */}
                <div
                  className={`p-5 border-t rounded-b-2xl ${sistema ? "bg-muted/60 dark:bg-transparent border-border" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"}`}
                >
                  <div
                    className={`flex items-center justify-center gap-3 ${sistema ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}
                  >
                    {!sistema && <AlertTriangle className="w-5 h-5 shrink-0" />}
                    {sistema ? (
                      <p className="text-sm leading-tight">
                        Al confirmar, los consumos se enviarán al sistema
                        administrativo bajo el nodo de{" "}
                        <strong>{sistema.toUpperCase()}</strong>. Asegúrese de
                        que el paciente y la cobertura coincidan con la orden
                        física.
                      </p>
                    ) : (
                      <p className="text-sm font-bold leading-tight uppercase tracking-wide">
                        Seleccione un sistema de ingreso para habilitar el envío
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      {/* --- SECCIÓN INFERIOR: PEDIDOS DE GUARDIA --- */}
      {(pacienteInterno || pacienteGuardia) && (
        <PedidosGuardiaSection
          pedidos={pedidosPaciente}
          loading={loadingPedidosPaciente}
        />
      )}
    </div>
  );
}
