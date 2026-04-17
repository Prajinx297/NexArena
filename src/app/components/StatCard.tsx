import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  delta?: string;
}

export function StatCard({ label, value, icon: Icon, suffix = '', trend, delta }: StatCardProps) {
  const animatedValue = useCountUp(value, 1500);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        {trend && delta && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' :
            trend === 'down' ? 'text-red-400 bg-red-500/10' :
            'text-slate-400 bg-slate-500/10'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-white">{animatedValue}{suffix}</p>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
