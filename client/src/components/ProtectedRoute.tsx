import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getUserRole, isAuthenticatedAsync } from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'supplier';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // בדיקת הרשאה אסינכרונית
  useEffect(() => {
    const verify = async () => {
      const isAuth = await isAuthenticatedAsync();
      if (!isAuth) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      if (requiredRole) {
        const role = await getUserRole();
        setUserRole(role);
      }

      setLoading(false);
    };

    verify();
  }, [requiredRole]);

  // בזמן טעינה
  if (loading) return <div>Loading...</div>;

  // אם לא מחובר — שלח ללוגין
  if (!isAuthenticatedAsync()) {
    return <Navigate to="/login" replace />;
  }

  // אם צריך רול ספציפי והרול לא תואם
  if (requiredRole && userRole && userRole !== requiredRole) {

    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (userRole === 'supplier') {
      return <Navigate to="/supplier/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
