import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { AuthService, type User } from "../services/auth.service";
import { toast } from "sonner"; // Usamos la librería nueva

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Función de Login ---
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const res = await AuthService.login(credentials);
      setUser(res.user); // Asumiendo que el backend devuelve el objeto usuario completo
      setIsAuthenticated(true);
      return res; // Retornamos para que el componente Login sepa que tuvo éxito
    } catch (error: any) {
      // Manejo de error local, limpio y directo
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(msg); // Lanzamos el error para que lo atrape el formulario
    }
  };

  // --- Función de Logout ---
  const logout = () => {
    // Lo hacemos "fire and forget" (no esperamos al backend para limpiar el front)
    setUser(null);
    setIsAuthenticated(false);
    AuthService.logout().catch(console.error); // Avisamos al backend en segundo plano
    toast.info("Sesión cerrada");
  };

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await AuthService.verifyToken();
        if (res && res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Token no válido o expirado");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
