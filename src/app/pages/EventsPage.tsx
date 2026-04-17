import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/Navbar";
import { MapPin, Users, Calendar, ChevronRight } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Event {
  id: string;
  name: string;
  stadium: string;
  city: string;
  date: string;
  capacity: string;
  image: string;
  status: string;
}

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        setEvents(response.data.events);
        if (response.data.events.length > 0) {
          setHoveredEvent(response.data.events[0]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="relative flex min-h-screen pt-24 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredEvent?.id || "default"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${hoveredEvent?.image || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop"})`,
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-black font-['Poppins',sans-serif] text-white tracking-tight leading-tight">
                Select Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  NexArena
                </span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg font-light">
                Enter the future of stadium experience. Real-time crowd data, AI navigation, and smart insights at your fingertips.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-[200px] bg-slate-900/50 rounded-3xl animate-pulse border border-white/5" />
                ))
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    layoutId={event.id}
                    onHoverStart={() => setHoveredEvent(event)}
                    onClick={() => navigate(`/dashboard/${event.id}`)}
                    className="relative p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            event.status === 'Live Now' 
                              ? 'bg-red-500/20 border-red-500/30 text-red-400'
                              : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 font-['Poppins',sans-serif]">
                          {event.stadium}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-1">
                          {event.name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Detailed View Panel */}
          <AnimatePresence mode="wait">
            {hoveredEvent && (
              <motion.div
                key={hoveredEvent.id}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className="hidden lg:block w-[400px] bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl sticky top-32 h-fit"
              >
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 border border-white/5">
                  <img src={hoveredEvent.image} alt={hoveredEvent.stadium} className="w-full h-full object-cover" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-4 font-['Poppins',sans-serif]">
                  {hoveredEvent.stadium}
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-400 text-sm">Capacity</span>
                    </div>
                    <span className="text-white font-bold">{hoveredEvent.capacity}</span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    Experience state-of-the-art AI monitoring, dynamic wayfinding, and premium fan services specifically tailored for {hoveredEvent.stadium}.
                  </p>

                  <button 
                    onClick={() => navigate(`/dashboard/${hoveredEvent.id}`)}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                  >
                    Enter Stadium Hub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
