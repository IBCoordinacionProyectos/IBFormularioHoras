import React, { useState } from 'react';
import FormularioHoras from './components/FormularioHoras';
import LoginPage from './components/LoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AuthenticatedUser {
  id: number;
  name: string;
}

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);

  const handleLoginSuccess = (userData: { employee_id: number; employee_name: string }) => {
    setAuthenticatedUser({ id: userData.employee_id, name: userData.employee_name });
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

  const handleSuccess = () => {
    console.log("Operación exitosa, actualizando resumen...");
    // Esta función se mantiene por si es necesaria para otros componentes.
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden">
      <ToastContainer />
      

      <div className="flex-grow flex flex-col min-h-0">
        {authenticatedUser ? (
            <FormularioHoras 
              onSuccess={handleSuccess} 
              employeeId={authenticatedUser.id} 
              employeeName={authenticatedUser.name}
              onLogout={handleLogout}
            />
        ) : (
          <div className="h-full flex items-center justify-center">
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;