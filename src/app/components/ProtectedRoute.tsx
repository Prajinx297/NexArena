import { Link, Navigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { DashboardSkeleton } from "./LoadingSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("fan" | "host")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    if (role === "host") {
      return <Navigate to="/host/events" replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <div className="max-w-md rounded-[32px] border p-8 text-center shadow-2xl" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--accent)" }}>Access denied</p>
          <h1 className="mt-4 font-display text-3xl font-semibold">Host access required</h1>
          <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            This command-center route is only available to authenticated host accounts.
          </p>
          <Link to="/events" className="mt-6 inline-flex rounded-full px-5 py-3 font-semibold" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>
            Return to fan events
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
