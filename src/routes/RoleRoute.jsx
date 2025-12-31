import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allow }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!allowed.includes(role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
