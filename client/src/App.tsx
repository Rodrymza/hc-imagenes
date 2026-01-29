import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

// Páginas
import LoginPage from "./pages/Login";
import InternacionPage from "./pages/InternacionPage"; // 2. La página nueva
import { ProtectedRoute } from "./components/protectedRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import PedidosGuardiaPage from "./pages/PedidosGuardiaPage";
import ConsuomsPage from "./pages/ConsumosPage";
import BuscarPaciente from "./pages/BuscarPaciente";

// Dashboard temporal (puedes borrarlo si ya vas a usar Internacion como home)
const Dashboard = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold">Panel Principal</h1>
    <p>Bienvenido al sistema HC Imágenes.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />

      <BrowserRouter>
        <Routes>
          {/* === RUTAS PÚBLICAS === */}
          <Route path="/login" element={<LoginPage />} />

          {/* === RUTAS PROTEGIDAS === */}
          {/* Todo lo que esté anidado aquí, pasará por la verificación de seguridad */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Si intentan entrar aquí sin login, el ProtectedRoute los patea fuera */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/internacion" element={<InternacionPage />} />
              <Route path="/guardia" element={<PedidosGuardiaPage />} />
              <Route path="/consumos" element={<ConsuomsPage />} />
              <Route path="/buscar-paciente" element={<BuscarPaciente />} />
              {/* Aquí agregarás guardia, configuración, etc. */}
            </Route>
          </Route>

          {/* === REDIRECCIONES === */}
          {/* Si entran a la raíz, mándalos directo a Internación (o Dashboard) */}
          <Route path="/" element={<Navigate to="/internacion" replace />} />

          {/* Si escriben cualquier ruta que no existe, al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
