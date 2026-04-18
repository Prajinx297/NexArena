import { motion } from "motion/react";

interface GateDensityRingProps {
  gates: Record<string, number>;
}

function toneForDensity(value: number) {
  if (value >= 75) return "#ef4444";
  if (value >= 55) return "#f59e0b";
  return "#22c55e";
}

function shortGateName(gate: string) {
  return gate.replace(/\s*\(.+\)/, "");
}

export function GateDensityRing({ gates }: GateDensityRingProps) {
  const entries = Object.entries(gates).slice(0, 8);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  if (!entries.length) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {entries.map(([gate, density]) => {
        const offset = circumference - (density / 100) * circumference;
        const color = toneForDensity(density);
        return (
          <div key={gate} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-4">
              <svg width="88" height="88" viewBox="0 0 88 88" aria-label={`${gate} density ${density}%`}>
                <circle cx="44" cy="44" r={radius} fill="transparent" stroke="rgba(148,163,184,0.16)" strokeWidth="8" />
                <motion.circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeLinecap="round"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  transform="rotate(-90 44 44)"
                />
                <text x="44" y="48" textAnchor="middle" fill="var(--text-primary)" fontSize="17" fontWeight="700">
                  {density}%
                </text>
              </svg>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{shortGateName(gate)}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {density >= 75 ? "Critical" : density >= 55 ? "Medium" : "Low"} density
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
