import React, { useState } from 'react';
import { loginUser } from '../api/horasApi';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Lock, Loader2, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userData: { employee_id: number; employee_name: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Previene el comportamiento por defecto, establece el estado de carga,
   * y llama a la API de login.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simula una llamada a la API con un pequeño retardo
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await loginUser({ username, password });
      onLoginSuccess(response);
    } catch (err: any) {
      setError('El usuario o la contraseña son incorrectos. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <img src="/logo2.png" alt="Logo Ingenio BIM" className="h-16 mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold text-secondary-foreground">Bienvenido de Nuevo</CardTitle>
        <CardDescription>Inicia sesión para registrar tus horas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10">
                <User className="h-5 w-5 text-secondary-foreground/90 hover:text-secondary-foreground transition-colors duration-200" />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="ej. juan.perez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10">
                <Lock className="h-5 w-5 text-secondary-foreground/90 hover:text-secondary-foreground transition-colors duration-200" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-sm text-destructive p-3 rounded-md text-center">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando Sesión...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
