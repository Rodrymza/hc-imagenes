import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("Conectando con el backend...");

  useEffect(() => {
    // Intentamos llamar a un endpoint de tu backend (ej: el de login o uno de prueba)
    fetch("/api/health") // Cambia '/api/status' por algún endpoint real que tengas o crea uno de prueba
      .then((res) => res.json())
      .then((data) =>
        setMensaje("🚀 Backend conectado: " + (data.message || "OK")),
      )
      .catch(() => setMensaje("❌ Error: El backend no responde"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-3xl font-bold">{mensaje}</h1>
    </div>
  );
}

export default App;
