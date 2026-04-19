import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
          <h2 className="mb-3 text-2xl font-bold text-red-500">Something went wrong</h2>
          <p className="mb-6 max-w-md text-sm text-[var(--text-secondary)]">{this.state.error?.message ?? "An unexpected error occurred."}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-sky-500 px-6 py-2 text-white transition-colors hover:bg-sky-400"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
