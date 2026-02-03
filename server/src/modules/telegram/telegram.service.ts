const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log("variables telegram:", TELEGRAM_TOKEN, CHAT_ID);

export const enviarNotificacionTelegram = async (mensaje: string) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Connection: "close",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando mensaje a Telegram: ${error}`);
  }
};
