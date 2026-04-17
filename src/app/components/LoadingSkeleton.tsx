import { motion } from "motion/react";

export function LoadingSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          className="h-4 bg-slate-800 rounded-lg"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"
        />
        <div className="space-y-2">
          <p className="text-white font-bold font-['Poppins',sans-serif] text-lg">Loading Dashboard</p>
          <p className="text-slate-500 text-sm">Syncing real-time data...</p>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-6 bg-slate-800 rounded-lg"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-5 w-32 bg-slate-800 rounded-lg"
        />
      </div>
      <LoadingSkeleton lines={4} />
    </div>
  );
}
