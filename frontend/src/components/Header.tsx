import React from 'react';
import { Button } from './ui/button';
import { LogOut, Bell, BarChart2, Clock, FileClock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export interface HeaderProps {
  employeeName?: string;
  onLogout: () => void;
  onShowPowerBI: () => void;
  onNavigateToHours: () => void;
  onNavigateToPermissions: () => void;
  currentView?: 'hours' | 'permissions';
}

const Header: React.FC<HeaderProps> = ({ 
  employeeName, 
  onLogout, 
  onShowPowerBI, 
  onNavigateToHours, 
  onNavigateToPermissions,
  currentView = 'hours'
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <header className="bg-surface-strong text-surface-strong-fg shadow-sm">
      {/* right = max-content para que el usuario use el espacio que necesite */}
      <div className="container mx-auto px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_max-content] items-center gap-4">
        {/* Izquierda: logo */}
        <div>
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>

        {/* Centro: navegación y título */}
        <div className="flex flex-col items-center">
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-center">
            Sistema de Gestión
          </h1>
          <div className="flex gap-2 mt-1">
            <Link to="/horas" className="no-underline">
              <Button 
                variant={isActive('/horas') ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 ${isActive('/horas') ? 'bg-primary hover:bg-primary/90' : 'text-white hover:bg-white/20'}`}
              >
                <Clock className="h-4 w-4 mr-1" />
                <span>Horas</span>
              </Button>
            </Link>
              <Button
                variant={isActive('/permisos') ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 ${isActive('/permisos') ? 'bg-primary hover:bg-primary/90' : 'text-white hover:bg-white/20'} opacity-50 cursor-not-allowed`}
                disabled
              >
                <FileClock className="h-4 w-4 mr-1" />
                <span>Permisos</span>
              </Button>
          </div>
        </div>

        {/* Derecha: acciones (puede crecer según contenido) */}
        <div className="flex items-center gap-3 justify-self-end text-white min-w-0">
          {/* Botón de Power BI solo visible para Luisa Fernanda Londoño Ciro */}
          {employeeName === 'Luisa Fernanda Londoño Ciro' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 shrink-0"
              aria-label="Ver reportes"
              onClick={onShowPowerBI}
              title="Ver reportes de Power BI"
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 shrink-0"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {employeeName && (
            <span className="text-sm sm:text-base font-medium whitespace-nowrap">
              Hola, {employeeName}
            </span>
          )}

          {employeeName && (
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
