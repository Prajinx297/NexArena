import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { DashboardSkeleton } from "./LoadingSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("fan" | "host")[];
  requiredRole?: "fan" | "host";
}

export function ProtectedRoute({ children, allowedRoles, requiredRole }: ProtectedRouteProps) {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const authorizedRoles = requiredRole ? [requiredRole] : allowedRoles;
  if (authorizedRoles && !authorizedRoles.includes(role)) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
}
