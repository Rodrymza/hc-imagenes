import { useEffect, useRef, useState } from "react";
import {
  Search,
  Database,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Loader2,
  Clock,
  Zap,
} from "lucide-react";
import { useConsumos } from "@/hooks/useConsumos";
import { toast } from "sonner";
import { PanelConsumos } from "@/components/pedidos/PanelConsumos";
import { useSearchParams } from "react-router-dom";
import { useServicioGuardia } from "@/hooks/usePedidosGuardia";
import { getEstiloEstudio } from "@/components/pedidos/utils";

export default function ConsumosPage() {
  const [sistema, setSistema] = useState("ambulatorio");
  const [coberturaId, setCoberturaId] = useState("");
  const [searchParams] = useSearchParams();
  const dniDesdeUrl = searchParams.get("dni"); // Captura el ?dni=12345678
  const hcDesdeUrl = searchParams.get("hc");
  const [dniBusqueda, setDniBusqueda] = useState(
    dniDesdeUrl || hcDesdeUrl || "",
  );
  const [tipoBusqueda, setTipoBusqueda] = useState(hcDesdeUrl ? "hc" : "dni");

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

  useEffect(() => {
    if (dniDesdeUrl) {
      setDniBusqueda(dniDesdeUrl);
      setTipoBusqueda("dni");
      setSistema("ambulatorio");
      buscarPacienteInterno(dniDesdeUrl, null);
      buscarPacienteGuardia(dniDesdeUrl);
    } else if (hcDesdeUrl) {
      setDniBusqueda(hcDesdeUrl);
      setTipoBusqueda("hc");
      setSistema("internacion");
      buscarPacienteInterno(null, hcDesdeUrl);
    }
  }, [dniDesdeUrl, hcDesdeUrl, buscarPacienteInterno, buscarPacienteGuardia]);

  // Creamos una "memoria" para no repetir la búsqueda si el DNI es el mismo
  const ultimoDniBuscado = useRef("");

  useEffect(() => {
    // 1. Elegimos UN solo DNI válido por orden de prioridad (el primero que exista)
    const dniDeteccion =
      pacienteInterno?.dni || pacienteGuardia?.dni || dniDesdeUrl;

    // 2. Si tenemos un DNI válido Y es diferente al que acabamos de buscar...
    if (
      dniDeteccion &&
      dniDeteccion.length > 5 &&
      dniDeteccion !== ultimoDniBuscado.current
    ) {
      // 3. Lo guardamos en la memoria
      ultimoDniBuscado.current = dniDeteccion;

      // 4. Disparamos la búsqueda UNA sola vez
      buscarPedidosPaciente(dniDeteccion);
    }
  }, [
    pacienteInterno?.dni,
    pacienteGuardia?.dni,
    dniDesdeUrl,
    buscarPedidosPaciente,
  ]);

  const handleBuscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (dniBusqueda.length > 7) {
      buscarPacienteInterno(dniBusqueda, null);
      buscarPacienteGuardia(dniBusqueda);
    }
  };

  const handleFinalizar = async () => {
    // Lógica one-liner de cobertura
    const cobFinal =
      coberturaId || pacienteInterno?.coberturas?.[0]?.idCobertura || "09999";

    if (!pacienteInterno) return toast.error("Debe identificar un paciente");

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
                      {pacienteInterno?.apellidos || pacienteGuardia?.apellido},{" "}
                      {pacienteInterno?.nombres || pacienteGuardia?.nombres}
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
                      {pacienteInterno?.idPaciente ||
                        pacienteGuardia?.historiaClinica}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400 uppercase">
                      Documento
                    </span>
                    <span className="font-bold text-slate-700 tracking-widest">
                      {pacienteInterno?.dniString || pacienteGuardia?.dniString}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400 uppercase">
                      Fecha Nacimiento
                    </span>
                    <span className="font-bold text-slate-700">
                      {pacienteInterno?.fechaNacimientoString ||
                        pacienteGuardia?.fechaNacimientoString}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Sistema de Ingreso
                    </label>
                    <select
                      value={sistema}
                      onChange={(e) => setSistema(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
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
                    disabled={!pacienteInterno} // Bloqueado si no hay paciente
                  />
                </div>

                {/* FOOTER INFORMATIVO */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                  <div className="flex items-center gap-3 text-red-800">
                    <Database className="w-5 h-5 opacity-50" />
                    <p className="text-base leading-tight italic">
                      Al confirmar, los consumos se enviarán al sistema
                      administrativo bajo el nodo de{" "}
                      <strong>{sistema.toUpperCase()}</strong>. Asegúrese de que
                      el paciente y la cobertura coincidan con la orden física.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      {/* --- SECCIÓN INFERIOR: PEDIDOS DE GUARDIA --- */}
      {
        <div className="max-w-7xl mx-auto mt-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl border-2 border-amber-100 shadow-md overflow-hidden">
            {/* Header de Sección */}
            <div className="bg-amber-500 px-6 py-3 flex justify-between items-center">
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
                <div className="py-8 flex flex-col items-center justify-center text-amber-600/80 animate-pulse">
                  <Loader2 className="w-10 h-10 mb-3 animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest">
                    Buscando órdenes médicas...
                  </p>
                </div>
              ) : /* 2. ESTADO: CON DATOS */
              pedidosPaciente.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                  {pedidosPaciente.map((pedido) => (
                    <div
                      key={pedido.idEstudio}
                      className={`${pedido.realizado ? "bg-green-200 border-green-400" : "bg-orange-200 border-orange-400"} rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-amber-100 rounded-lg py-2 px-3 min-w-[60px]">
                          <Clock className="w-4 h-4 text-amber-600 mb-1" />
                          <span className="text-[10px] text-center font-black text-amber-800 whitespace-pre-line">
                            {pedido.fecha.split(" ")[0] || "---"}
                            {"\n"}
                            {pedido.fecha.split(" ")[1] || "---"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase leading-tight">
                            {pedido.pedido}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Solicita:{" "}
                            <span className="font-bold text-slate-700">
                              {pedido.doctor}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-sm ${pedido.realizado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} px-2 py-0.5 rounded font-bold uppercase`}
                            >
                              {pedido.realizado ? "Realizado" : "Pendiente"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-2  p-2 font-bold ${getEstiloEstudio(pedido.tipoEstudio).badge} ${getEstiloEstudio(pedido.tipoEstudio).text}  ${getEstiloEstudio(pedido.tipoEstudio).bg} ${getEstiloEstudio(pedido.tipoEstudio).border} ${getEstiloEstudio(pedido.tipoEstudio).badge} py-2 rounded-lg text-xs  transition-all shadow-sm active:scale-95`}
                      >
                        {getEstiloEstudio(pedido.tipoEstudio).icon}
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
      }
    </div>
  );
}
