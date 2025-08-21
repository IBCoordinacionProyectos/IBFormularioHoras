import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSafeNavigate } from './hooks/useSafeNavigate';

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
    if (import.meta.env.VITE_SKIP_LOGIN === 'true') {
      return { id: 999, name: 'Luisa Fernanda Londoño Ciro' };
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<'hours' | 'permissions'>('hours');
  const [showPowerBI, setShowPowerBI] = useState(false);

  useEffect(() => {
    console.log('Estado actualizado - currentView:', currentView);
    console.log('showPowerBI:', showPowerBI);
  }, [currentView, showPowerBI]);

  const navigate = useSafeNavigate();

  const handleLoginSuccess = (userData: { employee_id: number; employee_name: string }) => {
    setAuthenticatedUser({ id: userData.employee_id, name: userData.employee_name });
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
    navigate('/horas');
  };

  const handleShowPowerBI = () => {
    setShowPowerBI(true);
    navigate('/powerbi');
  };

  // ✅ Guards robustos: reciben element y devuelven JSX.Element
  const ProtectedRoute = ({ element }: { element: JSX.Element }) =>
    authenticatedUser ? element : <Navigate to="/login" replace />;

  const PublicRoute = ({ element }: { element: JSX.Element }) =>
    authenticatedUser ? <Navigate to="/horas" replace /> : element;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="top-right" richColors />
      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/"
            element={authenticatedUser ? <Navigate to="/horas" replace /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={
              <PublicRoute
                element={
                  <div className="flex items-center justify-center h-screen">
                    <div className="w-full max-w-md p-4">
                      <LoginPage onLoginSuccess={handleLoginSuccess} />
                    </div>
                  </div>
                }
              />
            }
          />

          <Route
            path="/horas"
            element={
              <ProtectedRoute
                element={
                  <FormularioHoras
                    onSuccess={handleSuccess}
                    employeeId={authenticatedUser?.id || 0}
                    employeeName={authenticatedUser?.name || ''}
                    onLogout={handleLogout}
                    onShowPowerBI={handleShowPowerBI}
                    onNavigateToHours={handleNavigateToHours}
                    onNavigateToPermissions={handleNavigateToPermissions}
                  />
                }
              />
            }
          />

          <Route
            path="/permisos"
            element={
              <ProtectedRoute
                element={
                  <FormularioPermisos
                    onSuccess={handleSuccess}
                    employeeId={authenticatedUser?.id || 0}
                    employeeName={authenticatedUser?.name || ''}
                    onLogout={handleLogout}
                    onShowPowerBI={handleShowPowerBI}
                    onNavigateToHours={handleNavigateToHours}
                  />
                }
              />
            }
          />

          <Route
            path="/powerbi"
            element={
              <ProtectedRoute
                element={<PowerBIPage onBack={handleBackToForm} />}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;