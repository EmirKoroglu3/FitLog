import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

/**
 * Hides admin pages from non-admins. This is only for the UI: the API itself rejects
 * every /admin call without the Admin role, so typing the URL gains nothing.
 */
export function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return user?.isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default AdminRoute;
