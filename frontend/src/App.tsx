import React, { useState } from 'react';
import { Toaster } from 'sonner';

// Application components
import FormularioHoras from './components/FormularioHoras';
import LoginPage from './components/LoginPage';

interface AuthenticatedUser {
  id: number;
  name: string;
}

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(() => {
    // Comprueba la variable de entorno para saltar el login en modo de desarrollo.
    if (process.env.REACT_APP_SKIP_LOGIN === 'true') {
      return { id: 999, name: 'Usuario de Desarrollo' }; // Usuario de prueba
    }
    return null;
  });

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="top-right" richColors />
      
      <main className="flex-1 w-full">
        {authenticatedUser ? (
          <FormularioHoras 
            onSuccess={handleSuccess} 
            employeeId={authenticatedUser.id} 
            employeeName={authenticatedUser.name}
            onLogout={handleLogout}
          />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-md p-4">
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        )}
      </main>

      {/* Footer can be added back if needed */}
    </div>
  );
}

export default App;