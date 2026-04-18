import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const EventsPage = lazy(() => import("./pages/EventsPage").then((module) => ({ default: module.EventsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const HostDashboardPage = lazy(() => import("./pages/HostDashboardPage").then((module) => ({ default: module.HostDashboardPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("./pages/SignupPage").then((module) => ({ default: module.SignupPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const HostEventSelectionPage = lazy(() =>
  import("./pages/HostEventSelectionPage").then((module) => ({ default: module.HostEventSelectionPage })),
);

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
      <ProtectedRoute allowedRoles={["fan"]}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/host",
    element: <Navigate to="/host/events" replace />,
  },
  {
    path: "/host/events",
    element: (
      <ProtectedRoute allowedRoles={["host"]}>
        <HostEventSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/host/:eventId",
    element: <Navigate to="/host/events" replace />,
  },
  {
    path: "/host-dashboard/:eventId",
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
