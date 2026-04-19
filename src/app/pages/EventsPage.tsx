import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronRight, MapPin, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { ErrorBanner } from "../components/ErrorBanner";
import type { Event } from "../types";
import { FALLBACK_IMAGE } from "../utils/helpers";
import { getEvents } from "../utils/api";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Events | NexArena";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setError(null);
        const nextEvents = await getEvents();
        if (!isMounted) return;
        setEvents(nextEvents);
        setHoveredEvent(nextEvents[0] ?? null);
      } catch (fetchError: any) {
        if (!isMounted) return;
        console.error("Failed to fetch events:", fetchError);
        setError(fetchError?.message ?? "Unable to load events. Please check your connection.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: hoveredEvent?.image ? `url(${hoveredEvent.image})` : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
            opacity: 0.16,
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--bg-primary), color-mix(in srgb, var(--bg-primary) 78%, transparent))" }} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:items-start">
          <section className="flex-1 space-y-8">
            {error ? <ErrorBanner message={error} /> : null}
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
            >
              ← Back to Home
            </Link>

            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em]" style={{ color: "var(--text-secondary)" }}>Choose your event</p>
              <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
                Select your NexArena experience.
              </h1>
              <p className="max-w-xl text-lg leading-8" style={{ color: "var(--text-secondary)" }}>
                Open a live fan dashboard with smart routing, food pickup, friend finding, and AI assistance.
              </p>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-2">
              {loading
                ? [1, 2, 3].map((item) => (
                    <div key={item} className="h-56 animate-pulse rounded-[32px] border" style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }} />
                  ))
                : events.map((event, index) => (
                    <motion.article
                      key={event.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      onMouseEnter={() => setHoveredEvent(event)}
                      onClick={() => navigate(`/dashboard/${event.id}`)}
                      className="group cursor-pointer overflow-hidden rounded-[32px] border p-6 transition hover:-translate-y-1"
                      style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ borderColor: "var(--border-color)", color: "var(--accent)" }}>
                          {event.status}
                        </span>
                        <div className="rounded-full p-2 opacity-0 transition group-hover:opacity-100" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                      <h2 className="mt-7 font-display text-2xl font-semibold">{event.stadium}</h2>
                      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{event.name}</p>
                      <div className="mt-7 grid gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" style={{ color: "var(--accent)" }} />{event.city}</span>
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{event.date}</span>
                      </div>
                    </motion.article>
                  ))}
            </div>
          </section>

          {hoveredEvent ? (
            <motion.aside
              key={hoveredEvent.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden w-[390px] rounded-[36px] border p-6 shadow-2xl lg:block"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
            >
              <div className="aspect-video overflow-hidden rounded-[26px]">
                <img src={hoveredEvent.image} alt={hoveredEvent.stadium} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-semibold">{hoveredEvent.stadium}</h2>
              <div className="mt-6 rounded-[24px] border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><Users className="h-4 w-4" />Capacity</span>
                  <span className="font-semibold">{hoveredEvent.capacity}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${hoveredEvent.id}`)}
                className="mt-6 w-full rounded-2xl px-5 py-4 font-semibold transition hover:brightness-110"
                style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
              >
                Enter Stadium Hub
              </button>
            </motion.aside>
          ) : null}
        </div>
      </main>
    </div>
  );
}
