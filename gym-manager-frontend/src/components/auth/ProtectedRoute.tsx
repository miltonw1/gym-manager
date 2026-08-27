import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/useAuthStore';

const ProtectedRoute = () => {
  const { accessToken, loadProfile } = useAuthStore();

  useEffect(() => {
    if (accessToken && typeof loadProfile === 'function') {
      loadProfile();
    }
  }, [accessToken, loadProfile]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
