// src/components/LoginPage.tsx
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const response = await loginUser({ username, password });
      onLoginSuccess(response);
    } catch {
      setError('El usuario o la contraseña son incorrectos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Capa fija que ocupa TODO el viewport y centra el contenido
    <div className="fixed inset-0 z-50">
      {/* Fondo a borde a borde */}
      <div className="absolute inset-0 bg-[#f2f6fd]" aria-hidden="true" />

      {/* Contenido centrado */}
      <div className="relative h-full w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <Card className="w-full max-w-[420px] sm:max-w-[460px] shadow-lg sm:rounded-2xl">
          <CardHeader className="text-center">
            <img src="/logo2.png" alt="Logo Ingenio BIM" className="h-14 sm:h-16 mx-auto mb-4" />
            <CardTitle className="text-xl sm:text-2xl font-bold text-secondary-foreground">
              Bienvenido de Nuevo
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Inicia sesión para registrar tus horas
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm sm:text-base">Usuario</Label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10">
                    <User className="h-5 w-5 text-secondary-foreground/90" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="ej. juan.perez"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-12 h-11 sm:h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Contraseña</Label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10">
                    <Lock className="h-5 w-5 text-secondary-foreground/90" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-11 sm:h-12 text-base"
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
                className="w-full h-11 sm:h-12 rounded-xl font-medium"
                style={{ backgroundColor: 'hsl(195 78% 16%)', color: '#fff' }}
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
      </div>
    </div>
  );
};

export default LoginPage;
