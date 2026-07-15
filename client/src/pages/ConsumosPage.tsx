import { useEffect, useRef, useState } from "react";
import {
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Loader2,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useConsumos } from "@/hooks/useConsumos";
import { toast } from "sonner";
import { PanelConsumos } from "@/components/pedidos/PanelConsumos";
import { useSearchParams } from "react-router-dom";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";
import { getEstiloEstudio } from "@/components/pedidos/utils";

export default function ConsumosPage() {
  const [coberturaId, setCoberturaId] = useState("");
  const [searchParams] = useSearchParams();
  const dniDesdeUrl = searchParams.get("dni");
  const hcDesdeUrl = searchParams.get("hc");
  const [dniBusqueda, setDniBusqueda] = useState(
    dniDesdeUrl || hcDesdeUrl || "",
  );
  const [tipoBusqueda, setTipoBusqueda] = useState(hcDesdeUrl ? "hc" : "dni");
  const [sistema, setSistema] = useState<string | null>(null);

  // No buscar hasta que se haga click en el boton

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

  // 1) Al montar con URL params, disparar búsquedas de paciente
  useEffect(() => {
    if (dniDesdeUrl) {
      buscarPacienteInterno(dniDesdeUrl, null);
      buscarPacienteGuardia(dniDesdeUrl);
    } else if (hcDesdeUrl) {
      buscarPacienteInterno(null, hcDesdeUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Cuando aparece un DNI válido (del interno, guardia o URL), buscar pedidos una sola vez
  const ultimoDniBuscado = useRef("");

  useEffect(() => {
    const dni = pacienteInterno?.dni || pacienteGuardia?.dni || dniDesdeUrl;

    if (dni && dni.length > 5 && dni !== ultimoDniBuscado.current) {
      ultimoDniBuscado.current = dni;
      buscarPedidosPaciente(dni);
    }
  }, [
    pacienteInterno?.dni,
    pacienteGuardia?.dni,
    dniDesdeUrl,
    buscarPedidosPaciente,
  ]);

  const handleBuscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    const valor = dniBusqueda.trim();

    if (valor.length < 3) return toast.error("Ingrese un valor válido");

    if (tipoBusqueda === "dni") {
      buscarPacienteInterno(valor, null);
      buscarPacienteGuardia(valor);

      buscarPedidosPaciente(valor);

      ultimoDniBuscado.current = valor;
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
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {/* HEADER DE PÁGINA */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-indigo-600" />
          Registro Manual de Consumos
        </h1>
        <p className="text-slate-500 text-sm">
          Imputación directa de prestaciones sin pedido electrónico previo.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: IDENTIFICACIÓN (4 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. BÚSQUEDA */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Identificar Paciente
            </h3>
            <form onSubmit={handleBuscar} className="flex gap-2">
              {/* SELECTOR DE TIPO */}
              <select
                value={tipoBusqueda}
                onChange={(e) => setTipoBusqueda(e.target.value)}
                className="bg-slate-100 border-none rounded-lg px-2 text-[10px] font-black uppercase text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="dni">DNI</option>
                <option value="hc">H.C.</option>
              </select>

              <input
                type="number"
                placeholder={
                  tipoBusqueda === "dni" ? "Ingrese DNI..." : "Ingrese HC..."
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
          {(pacienteInterno || pacienteGuardia) && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-emerald-500 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-80">
                      Paciente Identificado
                    </p>
                    <h2 className="text-xl font-black uppercase leading-tight">
                      {paciente?.apellido}, {paciente?.nombres}
                    </h2>
                  </div>
                  <ShieldCheck className="w-8 h-8 opacity-40" />
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400 uppercase">
                      Historia Clinica
                    </span>
                    <span className="font-bold text-slate-700">
                      {paciente?.historiaClinica}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400 uppercase">
                      Documento
                    </span>
                    <span className="font-bold text-slate-700 tracking-widest">
                      {paciente?.dniString}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400 uppercase">
                      Fecha Nacimiento
                    </span>
                    <span className="font-bold text-slate-700">
                      {paciente?.fechaNacimientoString}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Sistema de Ingreso
                    </label>
                    <select
                      value={sistema || ""}
                      onChange={(e) => setSistema(e.target.value || null)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">⚠️ Seleccione una opcion</option>
                      <option value="ambulatorio">📅 AMBULATORIO</option>
                      <option value="guardia">🚨 GUARDIA</option>
                      <option value="internacion">🏥 INTERNACIÓN</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Obra Social
                    </label>
                    <select
                      value={coberturaId}
                      onChange={(e) => setCoberturaId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {pacienteInterno?.coberturas.map((cob) => (
                        <option key={cob.idCobertura} value={cob.idCobertura}>
                          {cob.sigla}
                        </option>
                      )) || null}
                      <option value="09999">PACIENTES PARTICULAR</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* COLUMNA DERECHA: CONSUMOS (7 Cols) */}
        {pacienteInterno && (
          <div className="lg:col-span-7">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[500px]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Detalle de Prestaciones
                </h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
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
                  className={`p-5 border-t rounded-b-2xl ${sistema ? "bg-slate-50 border-slate-100" : "bg-amber-50 border-amber-200"}`}
                >
                  <div
                    className={`flex items-center justify-center gap-3 ${sistema ? "text-red-800" : "text-amber-800"}`}
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
        <div className="max-w-7xl mx-auto mt-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl border-2 border-amber-100 shadow-md overflow-hidden">
            {/* Header de Sección */}
            <div className="bg-teal-700 px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-wider leading-none">
                    Pedidos de Guardia Activos
                  </h3>
                  <p className="text-amber-100 text-[10px] font-bold uppercase mt-1">
                    Detección automática de órdenes médicas
                  </p>
                </div>
              </div>

              {/* El loader pequeñito en el header (opcional si ya ponemos el grande) */}
              {loadingPedidosPaciente && (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              )}
            </div>

            <div className="p-4 bg-amber-50/30 min-h-[150px] flex flex-col justify-center">
              {/* 1. ESTADO: CARGANDO */}
              {loadingPedidosPaciente ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4 bg-white border border-slate-100 animate-pulse flex items-center gap-4"
                    >
                      <div className="flex flex-col items-center gap-1.5 py-2 px-3 min-w-[60px]">
                        <div className="h-3 w-3 bg-slate-200 rounded" />
                        <div className="h-2.5 w-10 bg-slate-200 rounded" />
                        <div className="h-2.5 w-8 bg-slate-200 rounded" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                        <div className="h-5 bg-slate-200 rounded-full w-16 mt-1" />
                      </div>
                      <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : /* 2. ESTADO: CON DATOS */
              pedidosPaciente.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                  {[...pedidosPaciente]
                    .sort((a, b) => {
                      if (a.realizado !== b.realizado) return a.realizado ? 1 : -1;
                      return 0;
                    })
                    .map((pedido) => (
                    <div
                      key={pedido.idEstudio}
                      className={`${pedido.realizado ? "bg-emerald-50 border-emerald-200" : "bg-orange-200 border-orange-400"} rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center rounded-lg py-2 px-3 min-w-[60px] ${pedido.realizado ? "bg-emerald-100" : "bg-amber-100"}`}>
                          <Clock className={`w-4 h-4 mb-1 ${pedido.realizado ? "text-emerald-600" : "text-amber-600"}`} />
                          <span className={`text-[10px] text-center font-black whitespace-pre-line ${pedido.realizado ? "text-emerald-800" : "text-amber-800"}`}>
                            {pedido.fecha.split(" ")[0] || "---"}
                            {"\n"}
                            {pedido.fecha.split(" ")[1] || "---"}
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-sm font-black uppercase leading-tight ${pedido.realizado ? "text-emerald-900" : "text-slate-800"}`}>
                            {pedido.pedido}
                          </h4>
                          <p className={`text-[11px] mt-0.5 ${pedido.realizado ? "text-emerald-600" : "text-slate-500"}`}>
                            Solicita:{" "}
                            <span className={`font-bold ${pedido.realizado ? "text-emerald-700" : "text-slate-700"}`}>
                              {pedido.doctor}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-sm ${pedido.realizado ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"} px-2 py-0.5 rounded font-bold uppercase`}
                            >
                              {pedido.realizado ? "Realizado" : "Pendiente"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-2  p-2 font-bold ${pedido.realizado ? "bg-emerald-600 text-white border border-emerald-700" : `${getEstiloEstudio(pedido.tipoEstudio).badge} ${getEstiloEstudio(pedido.tipoEstudio).text} ${getEstiloEstudio(pedido.tipoEstudio).bg} ${getEstiloEstudio(pedido.tipoEstudio).border}`} py-2 rounded-lg text-xs transition-all shadow-sm active:scale-95`}
                      >
                        {pedido.realizado ? <CheckCircle2 className="w-4 h-4" /> : getEstiloEstudio(pedido.tipoEstudio).icon}
                        {pedido.tipoEstudio}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* 3. ESTADO: SIN DATOS (VACÍO) */
                <div className="py-10 flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <ClipboardList className="w-12 h-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">
                    El paciente no registra pedidos de guardia.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
