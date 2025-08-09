import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActividadesListProps {
  actividades: any[];
  onDelete: (id: number) => void;
  onEdit: (actividad: any) => void;
}

const ActividadesList: React.FC<ActividadesListProps> = ({ actividades, onDelete, onEdit }) => {

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
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-surface-soft rounded-lg shadow-sm border border-border-subtle hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-text-strong">
                    {actividad.proyectoNombre} - <span className="text-brand font-semibold">Ver Nota</span>
                  </h3>
                  <p className="text-sm text-text-soft">
                    {actividad.disciplina || 'SIN'} / {actividad.etapa || 'N/A'} - No Aplica
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-text-strong">{actividad.horas}h</p>
                  <p className="text-xs text-text-soft">{actividad.fecha}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <h4 className="font-semibold text-text-default">{actividad.actividad}</h4>
                {actividad.nota && (
                  <p className="text-sm text-text-soft mt-1">
                    <span className="font-medium">Nota:</span> {actividad.nota}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-surface-soft-hover px-4 py-2 flex justify-end rounded-b-lg">
              <button
                onClick={() => onEdit(actividad)}
                className="text-blue-500 hover:text-blue-700 transition-colors mr-2"
                aria-label={`Editar actividad ${actividad.actividad}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a1 1 0 011-1h2.586l-4 4H5z" />
                </svg>
              </button>
               <button
                onClick={() => onDelete(actividad.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label={`Eliminar actividad ${actividad.actividad}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ActividadesList;