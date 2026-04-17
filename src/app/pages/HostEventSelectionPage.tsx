import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/Navbar";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useToast } from "../context/ToastContext";
import { Shield, Calendar, MapPin, Zap } from "lucide-react";
import type { Event } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function HostEventSelectionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = () => {
    setFetchError(null);
    setLoading(true);
    fetch(`${API_BASE_URL}/events`)
      .then((r) => r.json())
      .then((d) => { if (d.events) setEvents(d.events); })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Staff Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            NexArena <span className="text-cyan-400">Command Center</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Select an event to access security monitoring, crowd analytics, and broadcast tools.</p>
        </div>

        {fetchError && <ErrorBanner message={fetchError} onRetry={fetchEvents} />}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-72"><LoadingSkeleton lines={5} /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/host/${event.id}`)}
                className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                  <img src={event.image} alt={event.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border ${
                      event.status === 'Live Now'
                        ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                    }`}>
                      {event.status === 'Live Now' && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />}
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">{event.name}</h3>
                  <div className="space-y-2 text-sm text-slate-400">
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" />{event.stadium}, {event.city}</p>
                    <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-500" />{event.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}


      </main>
    </div>
  );
}
