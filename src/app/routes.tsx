import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { EventsPage } from "./pages/EventsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HostDashboardPage } from "./pages/HostDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { HostEventSelectionPage } from "./pages/HostEventSelectionPage";
// Legacy path redirect

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/events",
    Component: EventsPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/my-tickets",
    element: <Navigate to="/events" replace />,
  },
  {
    path: "/dashboard/:eventId",
    element: (
      <ProtectedRoute allowedRoles={["fan", "host"]}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/host",
    element: (
      <ProtectedRoute allowedRoles={["host"]}>
        <HostEventSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/host/:eventId",
    element: (
      <ProtectedRoute allowedRoles={["host"]}>
        <HostDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
