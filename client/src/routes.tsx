import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protectedRoute";
import { AdminRoute } from "./components/adminRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import LoginPage from "./pages/Login";
import InternacionPage from "./pages/InternacionPage";
import PedidosGuardiaPage from "./pages/PedidosGuardiaPage";
import ConsumosPage from "./pages/ConsumosPage";
import BuscarPaciente from "./pages/BuscarPaciente";
import PacientesInternadosPage from "./pages/PacientesInternadosPage";
import AdminUsuariosPage from "./pages/AdminUsuariosPage";

const Dashboard = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold">Panel Principal</h1>
    <p>Bienvenido al sistema HC Imágenes.</p>
  </div>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/internacion" element={<InternacionPage />} />
        <Route path="/guardia" element={<PedidosGuardiaPage />} />
        <Route path="/consumos" element={<ConsumosPage />} />
        <Route path="/buscar-paciente" element={<BuscarPaciente />} />
        <Route path="/pacientes-internacion" element={<PacientesInternadosPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<Navigate to="/internacion" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
