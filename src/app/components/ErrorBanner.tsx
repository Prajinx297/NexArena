import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-red-300 font-semibold">Something went wrong</p>
        <p className="text-red-400/80 text-sm mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
