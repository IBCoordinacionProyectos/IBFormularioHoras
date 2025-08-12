import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Application components
import FormularioHoras from './components/FormularioHoras';
import FormularioPermisos from './components/FormularioPermisos';
import LoginPage from './components/LoginPage';
import PowerBIPage from './components/PowerBIPage';

interface AuthenticatedUser {
  id: number;
  name: string;
}

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(() => {
    // Comprueba la variable de entorno para saltar el login en modo de desarrollo.
    if (import.meta.env.VITE_SKIP_LOGIN === 'true') {
      return { id: 999, name: 'Luisa Fernanda Londoño Ciro' }; // Usuario de prueba
    }
    return null;
  });
  
  const [currentView, setCurrentView] = useState<'hours' | 'permissions'>('hours');
  const [showPowerBI, setShowPowerBI] = useState(false);

  // Efecto para depurar cambios en el estado
  useEffect(() => {
    console.log('Estado actualizado - currentView:', currentView);
    console.log('showPowerBI:', showPowerBI);
  }, [currentView, showPowerBI]);

  const handleLoginSuccess = (userData: { employee_id: number; employee_name: string }) => {
    setAuthenticatedUser({ 
      id: userData.employee_id, 
      name: userData.employee_name 
    });
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setShowPowerBI(false);
  };

  const handleSuccess = () => {
    console.log("Operation successful, summary update might be needed.");
  };

  const handleNavigateToHours = () => {
    setCurrentView('hours');
    setShowPowerBI(false);
  };

  const handleNavigateToPermissions = () => {
    setCurrentView('permissions');
    setShowPowerBI(false);
  };

  const handleBackToForm = () => {
    setShowPowerBI(false);
  };

  const handleShowPowerBI = () => {
    setShowPowerBI(true);
  };

  // Componente de rutas protegidas
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authenticatedUser) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  // Componente de rutas públicas
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (authenticatedUser) {
      return <Navigate to="/horas" replace />;
    }
    return <>{children}</>;
  };

  // Componente de enrutamiento
  const AppRoutes = () => {
    const location = useLocation();
    
    // Si estamos en la ruta raíz, redirigir a /horas o /login según autenticación
    if (location.pathname === '/') {
      return <Navigate to={authenticatedUser ? "/horas" : "/login"} replace />;
    }

    return (
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={
          <PublicRoute>
            <div className="flex items-center justify-center h-screen">
              <div className="w-full max-w-md p-4">
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          </PublicRoute>
        } />

        {/* Rutas protegidas */}
        <Route path="/horas" element={
          <ProtectedRoute>
            <FormularioHoras 
              onSuccess={handleSuccess} 
              employeeId={authenticatedUser?.id || 0} 
              employeeName={authenticatedUser?.name || ''}
              onLogout={handleLogout}
              onShowPowerBI={handleShowPowerBI}
              onNavigateToHours={handleNavigateToHours}
              onNavigateToPermissions={handleNavigateToPermissions}
            />
          </ProtectedRoute>
        } />

        <Route path="/permisos" element={
          <ProtectedRoute>
            <FormularioPermisos
              onSuccess={handleSuccess}
              employeeId={authenticatedUser?.id || 0}
              employeeName={authenticatedUser?.name || ''}
              onLogout={handleLogout}
              onShowPowerBI={handleShowPowerBI}
              onNavigateToHours={handleNavigateToHours}
              onNavigateToPermissions={handleNavigateToPermissions}
            />
          </ProtectedRoute>
        } />

        <Route path="/powerbi" element={
          <ProtectedRoute>
            <PowerBIPage onBack={handleBackToForm} />
          </ProtectedRoute>
        } />

        {/* Ruta por defecto para cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="top-right" richColors />
      <main className="flex-1 w-full">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;