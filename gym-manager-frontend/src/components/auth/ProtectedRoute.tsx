import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/useAuthStore';

const ProtectedRoute = () => {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
