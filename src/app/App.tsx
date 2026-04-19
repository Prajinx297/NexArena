import { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { FullScreenSpinner } from "./components/LoadingSkeleton";

function AppShell() {
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => setIsOnline(true);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      {!isOnline ? (
        <div className="fixed inset-x-0 top-0 z-[300] bg-red-500 py-1.5 text-center text-sm text-white">
          You are offline - some features may be unavailable
        </div>
      ) : null}
      <Suspense fallback={<FullScreenSpinner />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
