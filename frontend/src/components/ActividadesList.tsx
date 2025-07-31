import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActividadesListProps {
  actividades: any[];
  setActividades: React.Dispatch<React.SetStateAction<any[]>>;
}

const ActividadesList: React.FC<ActividadesListProps> = ({ actividades, setActividades }) => {
  const handleDelete = (id: number) => {
    setActividades(prev => prev.filter(act => act.id !== id));
  };

  if (actividades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" aria-live="polite">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p>No hay actividades registradas</p>
        <p className="text-sm mt-1">Las actividades que registres aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-live="polite">
      <AnimatePresence>
        {actividades.map(actividad => (
          <motion.div
            key={actividad.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
            aria-labelledby={`actividad-title-${actividad.id}`}
          >
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-indigo-100 text-indigo-700 rounded-lg p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 id={`actividad-title-${actividad.id}`} className="font-medium text-gray-800">
                    {actividad.actividad}
                  </h4>
                  <p className="text-sm text-gray-500">{actividad.fecha}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(actividad.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label={`Eliminar actividad ${actividad.actividad}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Proyecto</p>
                <p className="font-medium">{actividad.proyectoNombre}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Etapa</p>
                <p className="font-medium">{actividad.etapa || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Disciplina</p>
                <p className="font-medium">{actividad.disciplina || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Horas</p>
                <p className="font-medium text-indigo-600">{actividad.horas} hrs</p>
              </div>
              
              {actividad.nota && (
                <div className="md:col-span-4 mt-2 pt-2 border-t border-gray-100">
                  <p className="text-gray-500">Nota</p>
                  <p className="font-medium">{actividad.nota}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ActividadesList;