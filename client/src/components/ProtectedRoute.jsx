import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, adminOnly = false, redirectTo = '/login' }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) return <Navigate to={redirectTo} replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}

export default ProtectedRoute;
