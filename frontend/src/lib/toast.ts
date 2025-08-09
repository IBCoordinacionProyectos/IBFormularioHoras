import { toast, ToastOptions } from 'react-toastify';

// Tipos de notificación
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Configuración por defecto para los toasts
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

/**
 * Muestra una notificación toast
 * @param message Mensaje a mostrar
 * @param type Tipo de notificación (success, error, info, warning)
 * @param options Opciones adicionales para el toast
 */
export const showToast = (
  message: string,
  type: ToastType = 'info',
  options: Partial<ToastOptions> = {}
) => {
  const toastOptions = { ...defaultOptions, ...options };
  
  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast.warn(message, toastOptions);
      break;
    case 'info':
    default:
      toast.info(message, toastOptions);
      break;
  }
};

/**
 * Muestra un mensaje de éxito
 * @param message Mensaje a mostrar
 * @param options Opciones adicionales para el toast
 */
export const showSuccess = (message: string, options: Partial<ToastOptions> = {}) => {
  showToast(message, 'success', options);
};

/**
 * Muestra un mensaje de error
 * @param message Mensaje a mostrar
 * @param options Opciones adicionales para el toast
 */
export const showError = (message: string, options: Partial<ToastOptions> = {}) => {
  showToast(message, 'error', options);
};

/**
 * Muestra un mensaje de advertencia
 * @param message Mensaje a mostrar
 * @param options Opciones adicionales para el toast
 */
export const showWarning = (message: string, options: Partial<ToastOptions> = {}) => {
  showToast(message, 'warning', options);
};

/**
 * Muestra un mensaje informativo
 * @param message Mensaje a mostrar
 * @param options Opciones adicionales para el toast
 */
export const showInfo = (message: string, options: Partial<ToastOptions> = {}) => {
  showToast(message, 'info', options);
};
