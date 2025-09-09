import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Application components
import FormularioHoras from './components/FormularioHoras';
import FormularioPermisos from './components/FormularioPermisos';
import LoginPage from './components/LoginPage';
import PowerBIPage from './components/PowerBIPage';

interface AuthenticatedUser {
  id: number;
  name: string;
}

// Wrapper component for FormularioHoras that provides navigation
const FormularioHorasWrapper: React.FC<{
  onSuccess: () => void;
  employeeId: number;
  employeeName: string;
  onLogout: () => void;
  onShowPowerBI: () => void;
}> = ({ onSuccess, employeeId, employeeName, onLogout, onShowPowerBI }) => {
  const navigate = useNavigate();
  
  return (
    <FormularioHoras
      onSuccess={onSuccess}
      employeeId={employeeId}
      employeeName={employeeName}
      onLogout={onLogout}
      onShowPowerBI={onShowPowerBI}
      onNavigateToHours={() => navigate('/horas')}
      onNavigateToPermissions={() => navigate('/permisos')}
    />
  );
};

// Wrapper component for FormularioPermisos that provides navigation
const FormularioPermisosWrapper: React.FC<{
  onSuccess: () => void;
  employeeId: number;
  employeeName: string;
  onLogout: () => void;
  onShowPowerBI: () => void;
}> = ({ onSuccess, employeeId, employeeName, onLogout, onShowPowerBI }) => {
  const navigate = useNavigate();
  
  return (
    <FormularioPermisos
      onSuccess={onSuccess}
      employeeId={employeeId}
      employeeName={employeeName}
      onLogout={onLogout}
      onShowPowerBI={onShowPowerBI}
      onNavigateToHours={() => navigate('/horas')}
    />
  );
};

function App() {
 const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(() => {
    // Comprueba la variable de entorno para saltar el login en modo de desarrollo.
    if (import.meta.env.VITE_SKIP_LOGIN === 'true') {
      return { id: 999, name: 'Usuario de Desarrollo' }; // Usuario de prueba
    }
    return null;
  });
  
  const [showPowerBI, setShowPowerBI] = useState(false);

  const handleLoginSuccess = (userData: { employee_id: number; employee_name: string }) => {
    setAuthenticatedUser({ 
      id: userData.employee_id, 
      name: userData.employee_name 
    });
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

 const handleSuccess = () => {
    console.log("Operation successful, summary update might be needed.");
  };

  const handleShowPowerBI = () => {
    setShowPowerBI(true);
  };

  const handleHidePowerBI = () => {
    setShowPowerBI(false);
  };

  // If showing Power BI page, render it exclusively
  if (showPowerBI && authenticatedUser) {
    return <PowerBIPage onBack={handleHidePowerBI} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Toaster position="top-right" richColors />
        
        <main className="flex-1 w-full">
          {!authenticatedUser ? (
            <div className="flex items-center justify-center h-screen">
              <div className="w-full max-w-md p-4">
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          ) : (
            <Routes>
              <Route 
                path="/horas" 
                element={
                  <FormularioHorasWrapper
                    onSuccess={handleSuccess}
                    employeeId={authenticatedUser.id}
                    employeeName={authenticatedUser.name}
                    onLogout={handleLogout}
                    onShowPowerBI={handleShowPowerBI}
                  />
                } 
              />
              <Route 
                path="/permisos" 
                element={
                  <FormularioPermisosWrapper
                    onSuccess={handleSuccess}
                    employeeId={authenticatedUser.id}
                    employeeName={authenticatedUser.name}
                    onLogout={handleLogout}
                    onShowPowerBI={handleShowPowerBI}
                  />
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to="/horas" replace />} 
              />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
