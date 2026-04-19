import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Navbar } from "../components/Navbar";
import { ChatbotWidget } from "../components/ChatbotWidget";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { useToast } from "../context/ToastContext";
import { Ticket, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { Ticket as TicketType } from "../types";
import { getUserTickets, verifyTicket as verifyTicketRequest } from "../utils/api";

export function MyTicketsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);

  useEffect(() => {
    document.title = "My Tickets | NexArena";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      try {
        const userId = currentUser?.uid ?? "test_user_id";
        const nextTickets = await getUserTickets(userId);
        if (isMounted) {
          setTickets(nextTickets);
        }
      } catch (fetchError) {
        console.error("Failed to fetch tickets:", fetchError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTickets();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    setError("");
    setVerifying(true);
    setVerified(false);

    try {
      const data = await verifyTicketRequest(selectedTicketId);
      if (data.valid) {
        setVerified(true);
        localStorage.setItem("current_ticket", JSON.stringify(data.ticket));
        showToast("Ticket verified! Redirecting to dashboard...", "success");
        setTimeout(() => navigate(`/dashboard/${data.ticket.event_id}`), 1200);
      }
    } catch {
      setError("Invalid ticket ID. Please try again.");
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
    } finally {
      setVerifying(false);
    }
  };

  const statusColors: Record<string, string> = {
    valid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    used: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">My Tickets</h1>
          {currentUser && (
            <p className="text-slate-400">Welcome back, <span className="text-cyan-400 font-medium">{currentUser.email}</span></p>
          )}
        </div>

        {/* Ticket Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <LoadingSkeleton lines={4} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No Tickets Found"
            description="You don't have any tickets yet. Browse events to purchase tickets."
            actionLabel="Browse Events"
            onAction={() => navigate("/events")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {tickets.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ rotateY: 1, scale: 1.01 }}
                className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group"
              >
                {/* Left stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${t.status === 'valid' ? 'bg-emerald-500' : t.status === 'used' ? 'bg-slate-500' : 'bg-amber-500'}`} />

                <div className="p-6 pl-7">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Event</p>
                      <h3 className="text-xl font-bold text-white">{t.event_id}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[t.status] || statusColors.valid}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Seat</p>
                      <p className="text-sm font-bold text-white">{t.seat}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Gate</p>
                      <p className="text-sm font-bold text-white">{t.gate}</p>
                    </div>
                  </div>

                  {/* Barcode look */}
                  <div className="border-t border-dashed border-white/10 pt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-mono">ID: <span className="text-cyan-400">{t.id}</span></p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="w-[2px] bg-white/20 rounded-full" style={{ height: `${Math.random() * 12 + 8}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Ticket className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Enter Event</h2>
              <p className="text-xs text-slate-500">Verify your ticket to access the live dashboard</p>
            </div>
          </div>

          <form noValidate onSubmit={handleVerifyTicket} className="space-y-4">
            <motion.div animate={shakeInput ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
              <input
                id="ticket-id"
                name="ticketId"
                aria-label="Ticket ID"
                type="text" value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                placeholder="e.g. TICKET-1234"
                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono"
              />
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert" className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />{error}
              </motion.div>
            )}

            {verified && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4" />Ticket verified! Redirecting...
              </motion.div>
            )}

            <button type="submit" disabled={verifying || verified}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {verifying ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> :
               verified ? <><CheckCircle className="w-4 h-4" />Verified!</> :
               "Verify Ticket & Enter"}
            </button>
          </form>
        </motion.div>
      </main>
      <ChatbotWidget />
    </div>
  );
}
