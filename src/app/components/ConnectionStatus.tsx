import type { ConnectionState } from '../types';

interface ConnectionStatusProps { status: ConnectionState; }

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = {
    connected:    { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Connected' },
    connecting:   { color: 'bg-amber-500', text: 'text-amber-400', label: 'Reconnecting' },
    disconnected: { color: 'bg-red-500', text: 'text-red-400', label: 'Offline' },
    error:        { color: 'bg-red-500', text: 'text-red-400', label: 'Error' },
  }[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className={config.text}>{config.label}</span>
    </div>
  );
}
