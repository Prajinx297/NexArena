import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FullScreenSpinner } from "./LoadingSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("fan" | "host")[];
  requiredRole?: "fan" | "host";
}

export function ProtectedRoute({ children, allowedRoles, requiredRole }: ProtectedRouteProps) {
  const { currentUser, role, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <FullScreenSpinner label="Loading secure content..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const authorizedRoles = requiredRole ? [requiredRole] : allowedRoles;
  if (authorizedRoles && !authorizedRoles.includes(role)) {
    return <Navigate to={role === "host" ? "/host/events" : "/events"} replace />;
  }

  return <>{children}</>;
}
