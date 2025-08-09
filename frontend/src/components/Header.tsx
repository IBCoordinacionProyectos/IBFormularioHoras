import React from 'react';
import { Button } from './ui/button';
import { LogOut, Bell } from 'lucide-react';

export interface HeaderProps {
  userName?: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout }) => {
  return (
    <header className="bg-surface-strong text-surface-strong-fg shadow-sm">
      {/* right = max-content para que el usuario use el espacio que necesite */}
      <div className="container mx-auto px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_max-content] items-center gap-4">
        {/* Izquierda: logo */}
        <div>
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>

        {/* Centro: título */}
        <h1 className="justify-self-center text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-center">
          Formulario de Registro de Horas
        </h1>

        {/* Derecha: acciones (puede crecer según contenido) */}
        <div className="flex items-center gap-3 justify-self-end text-white min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 shrink-0"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {userName && (
            <span className="text-sm sm:text-base font-medium whitespace-nowrap">
              Hola, {userName}
            </span>
          )}

          {userName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/10 shrink-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
