import { useNavigate, NavigateFunction, To } from 'react-router-dom';
import { getSafeNavigationTarget } from '../utils/urlValidation';

export function useSafeNavigate(): NavigateFunction {
  const navigate = useNavigate();
  
  return ((to: To, options?: any) => {
    // Handle back/forward navigation with numbers
    if (typeof to === 'number') {
      navigate(to);
      return;
    }

    const safeTarget = getSafeNavigationTarget(to.toString());
    navigate(safeTarget, options);
  }) as NavigateFunction;
}
