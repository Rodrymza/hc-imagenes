import {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { AuthService, type User } from "../services/auth.service";
import { GuardiaService } from "../services/guardia.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface AuthContextType {
  user: User | null;
  activeOperator: User | null;
  isAdminMode: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    username: string;
    password: string;
    totpCode?: string;
  }) => Promise<{ hsiLogin: boolean }>;
  logout: () => void;
  changeOperator: (pin: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeOperator, setActiveOperator] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdminMode = useMemo(() => {
    if (!user || !activeOperator) return false;
    return user.rol === "ADMIN" && user.id === activeOperator.id;
  }, [user, activeOperator]);

  const login = async (credentials: {
    username: string;
    password: string;
    totpCode?: string;
  }) => {
    try {
      const res = await AuthService.login(credentials);
      setUser(res.user);
      setActiveOperator(res.user);
      setIsAuthenticated(true);
      return { hsiLogin: res.hsiLogin };
    } catch (error: unknown) {
      const msg = getErrorMessage(error) || "Error al iniciar sesión";
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveOperator(null);
    setIsAuthenticated(false);
    AuthService.logout().catch(console.error);
    GuardiaService.logoutGuardia().catch(console.error);
    toast.info("Sesión cerrada");
  };

  const changeOperator = async (pin: string) => {
    const res = await AuthService.changeOperator(pin);
    setActiveOperator(res.operator);
    return res.operator;
  };

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await AuthService.verifyToken();
        if (res && res.user) {
          setUser(res.user);
          setActiveOperator(res.activeOperator);
          setIsAuthenticated(true);
        }
      } catch {
        console.error("Token no válido o expirado");
        setIsAuthenticated(false);
        setUser(null);
        setActiveOperator(null);
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
        activeOperator,
        isAdminMode,
        isAuthenticated,
        isLoading,
        changeOperator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
