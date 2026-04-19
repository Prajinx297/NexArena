/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useToast } from "../context/ToastContext";
import { Shield, Calendar, MapPin } from "lucide-react";
import type { Event } from "../types";
import { FALLBACK_IMAGE } from "../utils/helpers";
import { getEvents } from "../utils/api";

export function HostEventSelectionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchEvents = async (isMounted = true) => {
    setFetchError(null);
    setLoading(true);
    try {
      const nextEvents = await getEvents();
      if (isMounted) {
        setEvents(nextEvents);
      }
    } catch (error: any) {
      console.error("Failed to load host events:", error);
      if (isMounted) {
        setFetchError(error?.message ?? "Unable to load host events.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    document.title = "Host Events | NexArena";
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchEvents(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);


  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Staff Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
            NexArena <span style={{ color: "var(--accent)" }}>Command Center</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>Select an event to access security monitoring, crowd analytics, and broadcast tools.</p>
        </div>

        {fetchError && <ErrorBanner message={fetchError} onRetry={fetchEvents} />}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border p-6 h-72" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}><LoadingSkeleton lines={5} /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event, idx: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/host-dashboard/${event.id}`)}
                className="rounded-2xl overflow-hidden border transition-all cursor-pointer group shadow-[0_18px_60px_rgba(15,23,42,0.10)]"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                  <img src={event.image} alt={event.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border ${
                      event.status === "Live Now"
                        ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                    }`}>
                      {event.status === "Live Now" && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />}
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{event.name}</h3>
                  <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
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
