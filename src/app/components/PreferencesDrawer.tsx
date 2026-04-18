import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { UserPreferences } from "../types";

interface PreferencesDrawerProps {
  open: boolean;
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
  onClose: () => void;
}

export function PreferencesDrawer({ open, preferences, onChange, onClose }: PreferencesDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[180] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="fixed right-0 top-0 z-[190] h-full w-full max-w-sm border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200">Preferences</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Fan notifications</h2>
              </div>
              <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 space-y-4">
              {[
                { key: "notifications" as const, label: "Live notifications", description: "Receive route, alert, and order updates." },
                { key: "sound" as const, label: "Sound effects", description: "Play subtle audio cues for critical updates." },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    <span className="mt-1 block text-xs text-slate-400">{item.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={(event) => onChange({ ...preferences, [item.key]: event.target.checked })}
                    className="h-5 w-5 accent-sky-300"
                  />
                </label>
              ))}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
