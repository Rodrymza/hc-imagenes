import type { IDetallePedidoGuardia } from "@/types/pedidos";

export const PEDIDO_ANTIGUO_MS = 2 * 24 * 60 * 60 * 1000;

export type EstadoPedido = "activo" | "realizado" | "antiguo";

export function parseFechaPedido(fecha: string): Date | null {
  const [fechaParte, horaParte] = fecha.split(" ");
  const [dia, mes, anio] = fechaParte.split("/").map(Number);
  if (!dia || !mes || !anio) return null;
  const [hora, minuto] = (horaParte || "00:00").split(":").map(Number);
  return new Date(anio, mes - 1, dia, hora || 0, minuto || 0);
}

export function esPedidoAntiguo(fecha: string): boolean {
  const fechaPedido = parseFechaPedido(fecha);
  if (!fechaPedido) return false;
  return Date.now() - fechaPedido.getTime() > PEDIDO_ANTIGUO_MS;
}

export function getEstadoPedido(
  pedido: Pick<IDetallePedidoGuardia, "realizado" | "fecha">,
): EstadoPedido {
  if (pedido.realizado) return "realizado";
  if (esPedidoAntiguo(pedido.fecha)) return "antiguo";
  return "activo";
}

export function esPedidoActivo(
  pedido: Pick<IDetallePedidoGuardia, "realizado" | "fecha">,
): boolean {
  return getEstadoPedido(pedido) === "activo";
}