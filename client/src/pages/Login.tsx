import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setIsLoading(true);

    try {
      // Gracias al proxy de Vite, esto apunta a http://localhost:3000/api/login
      const response = await axios.post("/api/auth/login", {
        username: username,
        password: password,
      });

      toast.success(`Bienvenido, ${response.data.nombre || username}`);

      // Aquí guardarías el token si usas JWT
      // localStorage.setItem("token", response.data.token)

      // Por ahora, simulamos redirección
      console.log("Login exitoso:", response.data);
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message || "Error al Iniciar Sesión";
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleLogin}>
        {" "}
        {/* Envolvemos en un form para usar el Enter del teclado */}
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl italic">
                HC
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa al sistema de imágenes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full text-lg h-11"
              disabled={isLoading}
            >
              {isLoading ? "Validando..." : "Iniciar Sesión"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
