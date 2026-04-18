import { useEffect, useState } from "react";
import { motion } from "motion/react";

export interface JourneyEvent {
  id: string;
  label: string;
  timestamp: string;
  tone?: "blue" | "amber" | "red" | "emerald";
}

interface JourneyTimelineProps {
  storageKey: string;
  events: JourneyEvent[];
}

const toneClass = {
  blue: "bg-sky-300",
  amber: "bg-amber-300",
  red: "bg-red-400",
  emerald: "bg-emerald-300",
};

export function JourneyTimeline({ storageKey, events }: JourneyTimelineProps) {
  const [items, setItems] = useState<JourneyEvent[]>(() => {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    if (!events.length) return;
    setItems((current) => {
      const merged = [...events, ...current].filter(
        (event, index, all) => all.findIndex((candidate) => candidate.id === event.id) === index,
      );
      const next = merged.slice(0, 8);
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [events, storageKey]);

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Journey timeline</p>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-3"
          >
            <div className="flex flex-col items-center">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClass[item.tone ?? "blue"]}`} />
              {index < items.length - 1 ? <span className="mt-2 h-full min-h-8 w-px bg-white/10" /> : null}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
