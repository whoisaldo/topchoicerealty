import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PageLoader } from './Spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
