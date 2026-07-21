export function capitalize(text?: string): string {
  if (!text || typeof text !== "string") return "";

  let nuevoTexto = "";
  for (let i = 0; i < text.length; i++) {
    if (i === 0 || text[i - 1] === " ") {
      nuevoTexto += text[i].toUpperCase();
    } else {
      nuevoTexto += text[i].toLowerCase();
    }
  }
  return nuevoTexto;
}
