import { useAuthStore } from '../../store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('CANDIDATE' | 'ADMIN')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    const candidateUrl = import.meta.env.VITE_CANDIDATE_URL || 'https://www.youtube.com';
    window.location.href = candidateUrl;
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
