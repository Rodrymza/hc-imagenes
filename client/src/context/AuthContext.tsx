import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { AuthService, type User } from "../services/auth.service";
import { GuardiaService } from "../services/guardia.service";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    username: string;
    password: string;
    totpCode?: string;
  }) => Promise<{ hsiLogin: boolean }>;
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

  const login = async (credentials: {
    username: string;
    password: string;
    totpCode?: string;
  }) => {
    try {
      const res = await AuthService.login(credentials);
      setUser(res.user);
      setIsAuthenticated(true);
      return { hsiLogin: res.hsiLogin };
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    AuthService.logout().catch(console.error);
    GuardiaService.logoutGuardia().catch(console.error);
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
