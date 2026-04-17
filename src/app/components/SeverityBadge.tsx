import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps { severity: 'critical' | 'high' | 'medium' | 'low' | 'info'; }

const config = {
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', Icon: AlertTriangle, pulse: true },
  high:     { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', Icon: AlertCircle, pulse: false },
  medium:   { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', Icon: AlertCircle, pulse: false },
  low:      { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', Icon: Info, pulse: false },
  info:     { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', Icon: CheckCircle, pulse: false },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const c = config[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.border} ${c.text} ${c.pulse ? 'animate-pulse' : ''}`}>
      <c.Icon className="w-3 h-3" />
      {severity}
    </span>
  );
}
