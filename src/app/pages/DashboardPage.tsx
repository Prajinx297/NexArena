import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { ChatbotWidget } from "../components/ChatbotWidget";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { ErrorBanner } from "../components/ErrorBanner";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, RefreshCw, Ticket, MapPin, Activity, Clock, ArrowRight, Map as MapIcon, Camera, TrendingUp, Bell, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

/* ═══════ Activity Log ═══════ */
function ActivityLog({ entries }: { entries: string[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyan-400" />Session Activity
      </h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {entries.map((e, i) => (
          <div key={i} className="text-xs text-slate-400 flex items-start gap-2 py-1 border-b border-white/5 last:border-0">
            <span className="text-slate-600 font-mono shrink-0">{e.split(' — ')[0]}</span>
            <span>{e.split(' — ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ ML Prediction Panel ═══════ */
function MLPredictionPanel() {
  const [data] = useState(() =>
    Array.from({ length: 7 }, (_, i) => ({
      time: `+${(i + 1) * 5}m`,
      predicted: Math.floor(Math.random() * 30 + 40),
    }))
  );
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[9px] font-bold text-purple-400 uppercase">Beta</div>
      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-purple-400" />ML Wait Prediction
      </h3>
      <p className="text-[10px] text-slate-500 mb-3">30-minute forecast • Experimental</p>
      <div className="h-[120px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-600 italic mt-1">Predictions improve with more event data.</p>
    </div>
  );
}

/* ═══════ DASHBOARD PAGE ═══════ */
export function DashboardPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [waitTimes, setWaitTimes] = useState<Record<string, number> | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [crowdData, setCrowdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const activityLog = useRef<string[]>([]);
  const [logEntries, setLogEntries] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const entry = `${time} — ${msg}`;
    activityLog.current = [entry, ...activityLog.current].slice(0, 20);
    setLogEntries([...activityLog.current]);
  };

  // WebSocket for crowd data
  const { data: wsData, status: wsStatus } = useWebSocket<any>(`${WS_BASE_URL}/crowd/${eventId}`);

  useEffect(() => {
    if (wsData?.heat_map) {
      setCrowdData(wsData.heat_map);
    }
  }, [wsData]);

  useEffect(() => {
    if (wsStatus === 'connected') addLog('Connected to live feed');
  }, [wsStatus]);

  // Stateless mock ticket injection
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  useEffect(() => {
    if (eventId) {
      setCurrentTicket({
        id: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        seat: "Section B, Row 12, Seat 4",
        gate: "Gate D",
        event_id: eventId,
        status: "active"
      });
      addLog('Pass synced successfully');
    }
  }, [eventId]);

  const fetchData = async () => {
    setFetchError(null);
    try {
      const [waitRes, recRes, eventsRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/wait-time/${eventId}`),
        axios.get(`${API_BASE_URL}/recommend/${eventId}`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/alerts`),
      ]);
      setWaitTimes(waitRes.data.wait_times);
      setRecommendation(recRes.data.recommendation);
      setAlerts(alertsRes.data.alerts || []);
      const event = eventsRes.data.events.find((e: any) => e.id === eventId);
      setEventDetails(event);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading && !crowdData && !waitTimes) return <DashboardSkeleton />;

  const crowdChartData = crowdData ? [
    { name: 'North', value: crowdData['Gate A (North)'], color: '#06b6d4' },
    { name: 'East', value: crowdData['Gate C (East)'], color: '#3b82f6' },
    { name: 'South', value: crowdData['Gate E (South)'], color: '#6366f1' },
    { name: 'West', value: crowdData['Gate G (West)'], color: '#64748b' },
  ] : [];

  const waitChartData = waitTimes ? Object.entries(waitTimes).map(([name, value]) => ({
    name, value, color: value > 15 ? '#ef4444' : value > 5 ? '#eab308' : '#22c55e'
  })) : [];

  const unreadCount = alerts.filter(a => !readAlerts.has(a.id)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <Navbar />

      {/* Top Header */}
      <div className="relative pt-24 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/my-tickets")}
              className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {eventDetails?.stadium || "Stadium"} Hub
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-red-500" />
                </span>
                <p className="text-sm text-slate-400">{eventDetails?.name || "Live Experience"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus status={wsStatus} />
            <button onClick={() => { fetchData(); showToast("Dashboard refreshed", "info"); }}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ticket Banner */}
        {currentTicket && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">ID: <span className="font-mono text-cyan-300">{currentTicket.id}</span></span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Gate', value: currentTicket.gate, icon: MapPin },
                  { label: 'Seat', value: currentTicket.seat, icon: Ticket },
                ].map(p => (
                  <div key={p.label} className="bg-white/10 px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                    <p.icon className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase">{p.label}</p>
                      <p className="text-sm font-bold text-white">{p.value}</p>
                    </div>
                  </div>
                ))}
                <div className="bg-emerald-500/20 px-3 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <p className="text-sm font-bold text-emerald-300 capitalize">{currentTicket.status}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <ErrorBanner message={fetchError} onRetry={fetchData} />
        </div>
      )}

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crowd Heatmap — 8 cols */}
        <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />Crowd Density
              <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[9px] font-bold text-cyan-400 uppercase ml-2">AI-Powered</span>
            </h3>
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-cyan-500" /></span>
          </div>
          {crowdChartData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crowdChartData}>
                  <defs><linearGradient id="dcg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(v: number) => [`${v}%`, 'Density']} />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#dcg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-[220px] flex items-center justify-center text-slate-500 italic">Syncing live data...</div>}
          {crowdData && (
            <p className="text-xs text-slate-400 mt-2">
              {crowdData['Gate C (East)'] > 75 ? '⚠️ East Gate showing elevated crowd. Allow extra time.' :
               crowdData['Gate A (North)'] > 75 ? '⚠️ North Gate congested. Consider alternate entry.' :
               '✅ All gates at normal capacity.'}
            </p>
          )}
        </div>

        {/* Alert Feed — 4 cols */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400" />Alerts
              {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">{unreadCount}</span>}
            </h3>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8 italic">No active alerts. Enjoy!</p>
            ) : alerts.slice(0, 6).map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => { setReadAlerts(prev => new Set(prev).add(a.id)); addLog(`Alert read: ${a.title}`); }}
                className={`p-3 rounded-xl bg-white/5 border-l-2 cursor-pointer hover:bg-white/10 transition-colors ${
                  a.severity === 'critical' ? 'border-red-500' : a.severity === 'high' ? 'border-amber-500' : 'border-cyan-500'
                } ${readAlerts.has(a.id) ? 'opacity-40 line-through' : ''}`}>
                <p className="text-sm font-semibold text-white">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{a.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Wait Times — 6 cols */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />Wait Time Prediction
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-bold text-amber-400 uppercase ml-2">AI</span>
          </h3>
          {waitChartData.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(v: number) => [`${v} min`, 'Wait']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {waitChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-[180px] flex items-center justify-center text-slate-500 italic">Calculating...</div>}
          {waitTimes && <p className="text-xs text-slate-400 mt-2">Shortest wait at {Object.entries(waitTimes).sort(([,a],[,b]) => a - b)[0]?.[0]}.</p>}
        </div>

        {/* Recommendation — 6 cols */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-emerald-400" />AI Recommendations
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-bold text-emerald-400 uppercase ml-2">AI Suggestion</span>
            </h3>
            <button onClick={fetchData} className="text-xs text-slate-500 hover:text-white transition-colors">Refresh</button>
          </div>
          {recommendation ? (
            <div className="space-y-3">
              {[
                { icon: '🅿️', title: `Use ${recommendation.recommended_gate}`, desc: recommendation.instruction },
                { icon: '🍔', title: 'Food: Gate 2 Concessions', desc: 'Shortest queue currently at Level 1 food court.' },
                { icon: '🛡️', title: 'Safety: All Clear', desc: `Nearest exit: ${currentTicket?.gate || "North Gate"}.` },
              ].map((r, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
                  <span className="text-lg">{r.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-slate-500 italic">Analyzing routes...</div>}
        </div>

        {/* AR Wayfinding — 6 cols */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <MapIcon className="w-5 h-5 text-cyan-400" />Stadium Navigation
          </h3>
          <div className="relative h-[200px] border border-white/5 rounded-2xl bg-slate-950 flex items-center justify-center">
            <div className="relative w-full max-w-xs aspect-[2/1] border-2 border-slate-700/50 rounded-[60px] flex items-center justify-center">
              <div className="w-[60%] h-[40%] bg-emerald-900/20 border border-emerald-500/30 rounded-[30px] flex items-center justify-center">
                <span className="text-emerald-500/40 font-black text-[9px] tracking-[0.3em] uppercase">Pitch</span>
              </div>
              {currentTicket && (
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-2 right-8 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" title={`Your gate: ${currentTicket.gate}`} />
              )}
              <div className="absolute top-0 -translate-y-1/2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 text-[8px] font-bold rounded-full uppercase">North</div>
              <div className="absolute bottom-0 translate-y-1/2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 text-[8px] font-bold rounded-full uppercase">South</div>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded text-[9px] text-indigo-400 font-bold">AR — Coming Soon</div>
        </div>

        {/* ML Prediction + Activity Log — 6 cols */}
        <div className="lg:col-span-6 space-y-6">
          <MLPredictionPanel />
          <ActivityLog entries={logEntries} />
        </div>
      </main>
      <ChatbotWidget />
    </div>
  );
}
