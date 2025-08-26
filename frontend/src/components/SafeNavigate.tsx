import { Navigate, NavigateProps } from 'react-router-dom';

export const SafeNavigate = ({ to, ...props }: NavigateProps) => {
  // Ensure we're only using string paths for navigation
  const safePath = typeof to === 'string' ? to : '/';
  return <Navigate {...props} to={safePath} />;
};
