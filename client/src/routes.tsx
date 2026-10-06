import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protectedRoute";
import { AdminRoute } from "./components/adminRoute";
import { RoleRoute } from "./components/RoleRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "./pages/Login";
import InternacionPage from "./pages/InternacionPage";
import PedidosGuardiaPage from "./pages/PedidosGuardiaPage";
import DetalleGuardiaPage from "./pages/DetalleGuardiaPage";
import ConsumosPage from "./pages/ConsumosPage";
import BuscarPaciente from "./pages/BuscarPaciente";
import PacientesInternadosPage from "./pages/PacientesInternadosPage";
import AdminUsuariosPage from "./pages/AdminUsuariosPage";
import MamografiaPage from "./pages/MamografiaPage";

const Dashboard = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold">Panel Principal</h1>
    <p>Bienvenido al sistema HC Imágenes.</p>
  </div>
);

const HomeRedirect = () => {
  const { user } = useAuth();
  const destino =
    user?.rol === "MAMO" || user?.rol === "MEDICO"
      ? "/mamografia"
      : "/internacion";
  return <Navigate to={destino} replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route element={<RoleRoute roles={["ADMIN", "USER", "MAMO"]} />}>
          <Route path="/internacion" element={<InternacionPage />} />
          <Route path="/guardia" element={<PedidosGuardiaPage />} />
          <Route
            path="/guardia/paciente/:dni"
            element={<DetalleGuardiaPage />}
          />
          <Route path="/consumos" element={<ConsumosPage />} />
          <Route path="/buscar-paciente" element={<BuscarPaciente />} />
        </Route>
        <Route element={<RoleRoute roles={["ADMIN", "USER", "MEDICO", "MAMO"]} />}>
          <Route
            path="/pacientes-internacion"
            element={<PacientesInternadosPage />}
          />
        </Route>
        <Route element={<RoleRoute roles={["ADMIN", "MAMO", "MEDICO"]} />}>
          <Route path="/mamografia" element={<MamografiaPage />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<HomeRedirect />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);