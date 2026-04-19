import { motion } from "motion/react";

export function LoadingSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          animate={{ opacity: [0.26, 0.56, 0.26], scaleX: [0.98, 1, 0.98] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.08 }}
          className="h-4 rounded-full bg-white/10"
          style={{ width: `${86 - index * 12}%` }}
        />
      ))}
    </div>
  );
}

export function LoadingSpinner({
  size = "md",
  label,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div className={`animate-spin rounded-full border-2 border-sky-300/70 border-t-transparent ${sizeClass}`} />
      {label ? <p className="text-sm text-[var(--text-secondary)]">{label}</p> : null}
    </div>
  );
}

export function FullScreenSpinner({ label = "Loading NexArena..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_18%)]" />
      <div className="relative w-full max-w-xl rounded-[36px] border border-white/10 bg-white/[0.05] p-8 text-center shadow-[0_30px_90px_rgba(2,6,23,0.46)] backdrop-blur-2xl">
        <motion.div
          className="mx-auto h-14 w-14 rounded-full border-2 border-sky-300/20 border-t-sky-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-6 font-display text-2xl font-semibold text-white">Syncing live dashboards</p>
        <p className="mt-2 text-sm text-slate-300">Preparing crowd intelligence, route suggestions, and command surfaces.</p>
        <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5 text-left">
          <LoadingSkeleton lines={5} />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
      <div className="mb-6 flex items-center gap-3">
        <motion.div
          animate={{ opacity: [0.22, 0.5, 0.22] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-10 w-10 rounded-2xl bg-white/10"
        />
        <motion.div
          animate={{ opacity: [0.22, 0.5, 0.22] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-5 w-36 rounded-full bg-white/10"
        />
      </div>
      <LoadingSkeleton lines={4} />
    </div>
  );
}
