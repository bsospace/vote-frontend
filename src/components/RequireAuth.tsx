import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RequireAuthProps {
  children: JSX.Element;
  requireAdmin?: boolean;
}

export default function RequireAuth({
  children,
  requireAdmin = false,
}: RequireAuthProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // หรือแสดง spinner หรืออะไรที่แสดงว่าแอปกำลังโหลด
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
