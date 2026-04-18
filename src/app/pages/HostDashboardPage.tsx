import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { SeverityBadge } from "../components/SeverityBadge";
import { ErrorBanner } from "../components/ErrorBanner";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "../context/ToastContext";
import {
  Camera, X, Send, Lock, Siren, Shield, ArrowLeft, RefreshCw, AlertTriangle,
  Radio, Wifi, WifiOff, ChevronDown, Activity, Megaphone, Zap, Ambulance
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

const CAMERAS = [
  { id: 'CAM-01', label: 'North Gate', zone: 'north' },
  { id: 'CAM-02', label: 'East Stand', zone: 'east' },
  { id: 'CAM-03', label: 'South Gate', zone: 'south' },
  { id: 'CAM-04', label: 'West Stand', zone: 'west' },
  { id: 'CAM-05', label: 'VIP Entrance', zone: 'vip' },
  { id: 'CAM-06', label: 'Parking Lot A', zone: 'parking' },
];

/* ═══════ Camera Feed Component ═══════ */
function CameraFeed({ cam, density, onClick }: { cam: typeof CAMERAS[0]; density: number; onClick: () => void }) {
  const statusColor = density > 80 ? 'bg-red-500' : density > 55 ? 'bg-amber-500' : 'bg-emerald-500';
  const statusLabel = density > 80 ? 'Alert' : density > 55 ? 'Elevated' : 'Clear';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-slate-950 rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group aspect-video"
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-[scanDown_3s_linear_infinite]" />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-50 z-[2]" />

      {/* Simulated feed */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80" />

      {/* Top info */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[9px] font-bold text-white">
          <Camera className="w-3 h-3 text-cyan-400" />{cam.id}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[9px] font-bold">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor} ${density > 80 ? 'animate-pulse' : ''}`} />
          <span className={density > 80 ? 'text-red-400' : density > 55 ? 'text-amber-400' : 'text-emerald-400'}>{statusLabel}</span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between">
        <span className="text-[10px] text-slate-300 font-medium bg-black/50 px-2 py-0.5 rounded">{cam.label}</span>
        <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded">{density}%</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors z-[5]" />
    </motion.div>
  );
}

/* ═══════ Camera Modal ═══════ */
function CameraModal({ cam, density, onClose, alerts }: { cam: typeof CAMERAS[0]; density: number; onClose: () => void; alerts: any[] }) {
  const gaugeAngle = (density / 100) * 180 - 90;
  const zoneAlerts = alerts.filter(a => a.zone?.toLowerCase() === cam.zone);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">{cam.id} — {cam.label}</h2>
              <p className="text-xs text-slate-500">Expanded View • Live Feed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Feed */}
          <div className="relative bg-slate-950 aspect-video min-h-[250px]">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent animate-[scanDown_2s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60" />
            <div className="absolute bottom-4 left-4 text-[10px] text-emerald-400 font-mono animate-pulse">● REC</div>
            <div className="absolute top-4 right-4 text-[10px] text-slate-500 font-mono">{new Date().toLocaleTimeString()}</div>
          </div>

          {/* Data */}
          <div className="p-6 space-y-5">
            {/* Gauge */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-14">
                <svg viewBox="0 0 100 55" className="w-full h-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none"
                    stroke={density > 80 ? '#ef4444' : density > 55 ? '#f59e0b' : '#10b981'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(density / 100) * 126} 126`} />
                </svg>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl font-black text-white">{density}%</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Crowd Capacity</p>
                <p className="text-xs text-slate-500">{density > 80 ? 'Critical — Action Required' : density > 55 ? 'Elevated — Monitor closely' : 'Safe — Normal operations'}</p>
              </div>
            </div>

            {/* Zone Alerts */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Zone Alerts</p>
              {zoneAlerts.length === 0 ? (
                <p className="text-xs text-slate-600 italic">No active alerts for this zone.</p>
              ) : zoneAlerts.slice(0, 3).map((a, i) => (
                <div key={i} className={`text-xs p-2 rounded-lg mb-1.5 border-l-2 ${
                  a.severity === 'critical' ? 'border-red-500 bg-red-500/10 text-red-300' :
                  a.severity === 'high' ? 'border-amber-500 bg-amber-500/10 text-amber-300' :
                  'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                }`}>
                  {a.title}
                </div>
              ))}
            </div>

            <button className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Megaphone className="w-4 h-4" />Send Alert to Zone
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════ IoT Sensor Panel ═══════ */
function IoTSensorPanel() {
  const sensors = Array.from({ length: 8 }, (_, i) => ({
    id: `SNS-${String(i + 1).padStart(3, '0')}`,
    signal: Math.floor(Math.random() * 100),
    status: Math.random() > 0.2 ? 'online' : Math.random() > 0.5 ? 'weak' : 'offline',
  }));

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />IoT Sensor Network
        </h3>
        <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[9px] font-bold text-purple-400 uppercase">Coming Soon</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sensors.map((s) => (
          <div key={s.id} className="bg-white/5 rounded-lg p-2 text-center group" title="Physical sensor integration available in Enterprise plan">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              s.status === 'online' ? 'bg-emerald-500' : s.status === 'weak' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <p className="text-[9px] text-white font-mono">{s.id}</p>
            <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500/60 rounded-full" style={{ width: `${s.signal}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ HOST DASHBOARD PAGE ═══════ */
export function HostDashboardPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [expandedCam, setExpandedCam] = useState<typeof CAMERAS[0] | null>(null);
  const [alertFilter, setAlertFilter] = useState<string>('All');

  // Crowd densities per zone
  const [densities, setDensities] = useState<Record<string, number>>({
    north: 45, east: 62, south: 38, west: 55, vip: 28, parking: 41
  });

  // Crowd history for chart
  const historyRef = useRef<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Broadcast form
  const [broadcastSeverity, setBroadcastSeverity] = useState('info');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<string[]>([]);

  // Confirmation modal
  const [confirmAction, setConfirmAction] = useState<{ label: string; action: () => void } | null>(null);

  // WebSocket
  const { data: wsData, status: wsStatus } = useWebSocket<any>(`${WS_BASE_URL}/crowd/${eventId}`);

  useEffect(() => {
    if (wsData?.heat_map) {
      const hm = wsData.heat_map;
      setDensities(prev => ({
        north: hm['Gate A (North)'] ?? prev.north,
        east: hm['Gate C (East)'] ?? prev.east,
        south: hm['Gate E (South)'] ?? prev.south,
        west: hm['Gate G (West)'] ?? prev.west,
        vip: Math.floor(Math.random() * 30 + 20),
        parking: Math.floor(Math.random() * 40 + 30),
      }));
    }
  }, [wsData]);

  // Update chart data whenever densities change
  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const point = { time, ...densities };
    historyRef.current = [...historyRef.current.slice(-9), point];
    setChartData([...historyRef.current]);
  }, [densities]);

  // Also update densities on interval for non-WS zones
  useEffect(() => {
    const interval = setInterval(() => {
      setDensities(prev => ({
        ...prev,
        north: Math.max(10, Math.min(95, prev.north + Math.floor(Math.random() * 9 - 4))),
        east: Math.max(10, Math.min(95, prev.east + Math.floor(Math.random() * 9 - 4))),
        south: Math.max(10, Math.min(95, prev.south + Math.floor(Math.random() * 9 - 4))),
        west: Math.max(10, Math.min(95, prev.west + Math.floor(Math.random() * 9 - 4))),
        vip: Math.max(5, Math.min(60, prev.vip + Math.floor(Math.random() * 7 - 3))),
        parking: Math.max(10, Math.min(90, prev.parking + Math.floor(Math.random() * 7 - 3))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setFetchError(null);
    try {
      const [evRes, alRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/alerts`),
      ]);
      const ev = evRes.data.events.find((e: any) => e.id === eventId);
      setEventDetails(ev);
      setAlerts(alRes.data.alerts || []);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 10000);
    return () => clearInterval(i);
  }, [eventId]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/generate-alert`, {
        title: `[${broadcastSeverity.toUpperCase()}] ${broadcastTarget === 'all' ? 'All Zones' : broadcastTarget}`,
        description: broadcastMessage,
        severity: broadcastSeverity,
      });
      setRecentBroadcasts(prev => [broadcastMessage, ...prev.slice(0, 2)]);
      setBroadcastMessage('');
      showToast('Alert broadcasted to all connected users', 'success');
      fetchData();
    } catch {
      showToast('Failed to send broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/alerts/${alertId}`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      showToast('Alert resolved', 'info');
    } catch {
      showToast('Failed to resolve alert', 'error');
    }
  };

  if (loading) return <DashboardSkeleton />;

  const filteredAlerts = alertFilter === 'All' ? alerts : alerts.filter(a => a.severity === alertFilter.toLowerCase());

  const zoneTableData = CAMERAS.map(c => ({
    zone: c.label,
    capacity: densities[c.zone],
    status: densities[c.zone] > 80 ? 'Critical' : densities[c.zone] > 55 ? 'Elevated' : 'Safe',
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      {/* Top Bar */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/host')}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyan-400" />
                NexArena Control Center
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{eventDetails?.name || 'Event'} • {eventDetails?.stadium || 'Stadium'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"/><span className="relative rounded-full h-2.5 w-2.5 bg-red-500"/></span>
            <span className="text-xs font-bold text-red-400 uppercase">Live</span>
            <ConnectionStatus status={wsStatus} />
          </div>
        </div>
      </div>

      {fetchError && <div className="max-w-[1600px] mx-auto px-4 mb-4"><ErrorBanner message={fetchError} onRetry={fetchData} /></div>}

      {/* Main Grid */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Cameras + Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Camera Grid */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />Security Camera Grid
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CAMERAS.map(cam => (
                <CameraFeed key={cam.id} cam={cam} density={densities[cam.zone]} onClick={() => setExpandedCam(cam)} />
              ))}
            </div>
          </div>

          {/* Alert Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />Active Alerts
                {alerts.length > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full ml-1">{alerts.length}</span>}
              </h3>
            </div>
            <div className="flex gap-1 mb-3">
              {['All', 'Critical', 'High', 'Info'].map(f => (
                <button key={f} onClick={() => setAlertFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${alertFilter === f ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-white'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <p className="text-xs text-slate-600 py-4 text-center italic">No alerts matching filter.</p>
              ) : filteredAlerts.map((a, i) => (
                <motion.div key={a.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className={`p-2.5 rounded-xl bg-white/5 border-l-2 ${
                    a.severity === 'critical' ? 'border-red-500' : a.severity === 'high' ? 'border-amber-500' : 'border-cyan-500'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{a.description}</p>
                    </div>
                    <button onClick={() => handleResolveAlert(a.id)} className="text-[9px] text-slate-500 hover:text-red-400 shrink-0">Resolve</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Analytics + Zone Table (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Crowd Analytics Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />Crowd Analytics (Real-Time)
                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[8px] font-bold text-cyan-400 uppercase ml-1">Live</span>
              </h3>
            </div>
            <div className="h-[220px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="north" stroke="#06b6d4" strokeWidth={2} dot={false} name="North" />
                  <Line type="monotone" dataKey="east" stroke="#3b82f6" strokeWidth={2} dot={false} name="East" />
                  <Line type="monotone" dataKey="south" stroke="#8b5cf6" strokeWidth={2} dot={false} name="South" />
                  <Line type="monotone" dataKey="west" stroke="#64748b" strokeWidth={2} dot={false} name="West" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {densities.east > 75 ? '⚠️ East Stand approaching capacity threshold.' :
               densities.north > 75 ? '⚠️ North Gate showing elevated activity.' :
               '✅ All zones within normal parameters.'}
            </p>
          </div>

          {/* Zone Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
            <h3 className="text-sm font-bold text-white mb-3">Zone Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <th className="text-left py-2 font-semibold">Zone</th>
                    <th className="text-left py-2 font-semibold">Capacity</th>
                    <th className="text-left py-2 font-semibold">Status</th>
                    <th className="text-right py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneTableData.map((z, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-medium text-white">{z.zone}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${z.capacity > 80 ? 'bg-red-500' : z.capacity > 55 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${z.capacity}%` }} />
                          </div>
                          <span className="text-slate-300">{z.capacity}%</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          z.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          z.status === 'Elevated' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>{z.status}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => { setBroadcastTarget(z.zone); setBroadcastSeverity('warning'); }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold">Alert</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Broadcast + QuickActions (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Broadcast Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-cyan-400" />Broadcast Alert
            </h3>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <select value={broadcastSeverity} onChange={e => setBroadcastSeverity(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                <option value="info">ℹ️ Info</option>
                <option value="high">⚠️ Warning</option>
                <option value="critical">🚨 Critical</option>
              </select>
              <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                <option value="all">All Fans</option>
                {CAMERAS.map(c => <option key={c.zone} value={c.label}>{c.label}</option>)}
              </select>
              <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="Type alert message..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20" />
              <button type="submit" disabled={sending || !broadcastMessage.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <><RefreshCw className="w-3 h-3 animate-spin" />Sending...</> : <><Send className="w-3 h-3" />Send Broadcast</>}
              </button>
            </form>
            {recentBroadcasts.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Recent</p>
                {recentBroadcasts.map((b, i) => (
                  <p key={i} className="text-[10px] text-slate-400 py-1 border-b border-white/5 last:border-0 truncate">{b}</p>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />Quick Actions
            </h3>
            <div className="space-y-2">
              <button onClick={() => { showToast("Gate A locked successfully.", "warning"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white font-medium transition-colors border border-white/5">
                <Lock className="w-4 h-4 text-amber-400" />Lock Gate A
              </button>
              <button onClick={() => { setBroadcastSeverity("critical"); setBroadcastMessage("🚨 EMERGENCY: Please remain calm. Staff deployed to all zones."); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs text-red-300 font-medium transition-colors border border-red-500/20">
                <Siren className="w-4 h-4" />Emergency Broadcast
              </button>
              <button onClick={() => { showToast("Medical unit dispatched to your location.", "info"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white font-medium transition-colors border border-white/5">
                <Ambulance className="w-4 h-4 text-emerald-400" />Request Medical Unit
              </button>
              <button onClick={() => setConfirmAction({ label: 'Evacuate all zones', action: () => { showToast("Evacuation protocol initiated.", "warning"); setConfirmAction(null); } })}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs text-red-300 font-medium transition-colors border border-red-500/20">
                <AlertTriangle className="w-4 h-4" />Evacuate Zone
              </button>
            </div>
          </div>

          {/* IoT Panel */}
          <IoTSensorPanel />
        </div>
      </main>

      {/* Camera Expanded Modal */}
      <AnimatePresence>
        {expandedCam && (
          <CameraModal cam={expandedCam} density={densities[expandedCam.zone]} alerts={alerts} onClose={() => setExpandedCam(null)} />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-xl"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
                <h3 className="text-lg font-bold text-white">Confirm Action</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">Are you sure you want to <span className="text-red-400 font-semibold">{confirmAction.label}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-colors">Cancel</button>
                <button onClick={confirmAction.action}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 rounded-xl text-sm font-bold text-white transition-colors">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
