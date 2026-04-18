import { useMemo, useState } from "react";
import { motion } from "motion/react";

interface StadiumMapProps {
  densities: Record<string, number>;
  waitTimes: Record<string, number>;
  onGateSelect?: (gate: string) => void;
}

const gatePositions = [
  { key: "Gate A (North)", label: "Gate A", x: 220, y: 22, w: 124, h: 42 },
  { key: "Gate C (East)", label: "Gate C", x: 505, y: 154, w: 42, h: 124 },
  { key: "Gate E (South)", label: "Gate E", x: 220, y: 368, w: 124, h: 42 },
  { key: "Gate G (West)", label: "Gate G", x: 24, y: 154, w: 42, h: 124 },
];

function colorForDensity(value: number) {
  if (value >= 75) return "#ef4444";
  if (value >= 55) return "#f59e0b";
  return "#22c55e";
}

export function StadiumMap({ densities, waitTimes, onGateSelect }: StadiumMapProps) {
  const [activeGate, setActiveGate] = useState(gatePositions[0].key);
  const highestDensityGate = useMemo(() => {
    return gatePositions.reduce((current, gate) => {
      return (densities[gate.key] ?? 0) > (densities[current.key] ?? 0) ? gate : current;
    }, gatePositions[0]);
  }, [densities]);

  const active = gatePositions.find((gate) => gate.key === activeGate) ?? gatePositions[0];
  const activeWait = waitTimes[active.key] ?? Math.max(2, Math.round((densities[active.key] ?? 40) / 9));

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/20 p-4">
      <svg viewBox="0 0 570 430" className="h-auto w-full" role="img" aria-label="Interactive stadium map">
        <defs>
          <radialGradient id="stadiumGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.16)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0)" />
          </radialGradient>
        </defs>
        <rect width="570" height="430" rx="34" fill="url(#stadiumGlow)" />
        <ellipse cx="285" cy="215" rx="220" ry="160" fill="rgba(15,23,42,0.55)" stroke="rgba(148,163,184,0.18)" strokeWidth="2" />
        <ellipse cx="285" cy="215" rx="158" ry="102" fill="rgba(16,185,129,0.05)" stroke="rgba(34,197,94,0.26)" strokeWidth="2" />
        <rect x="168" y="150" width="234" height="130" rx="18" fill="rgba(2,6,23,0.45)" stroke="rgba(34,197,94,0.28)" />
        <line x1="285" y1="150" x2="285" y2="280" stroke="rgba(34,197,94,0.22)" />
        <circle cx="285" cy="215" r="31" fill="transparent" stroke="rgba(34,197,94,0.22)" />
        <text x="285" y="220" textAnchor="middle" fill="rgba(226,232,240,0.62)" fontSize="13" fontWeight="700">
          PITCH
        </text>

        {gatePositions.map((gate) => {
          const density = densities[gate.key] ?? 42;
          const isHot = highestDensityGate.key === gate.key;
          const fill = colorForDensity(density);
          return (
            <g
              key={gate.key}
              onClick={() => {
                setActiveGate(gate.key);
                onGateSelect?.(gate.label);
              }}
              className="cursor-pointer"
            >
              {isHot ? (
                <motion.rect
                  x={gate.x - 8}
                  y={gate.y - 8}
                  width={gate.w + 16}
                  height={gate.h + 16}
                  rx="18"
                  fill={fill}
                  opacity="0.2"
                  animate={{ opacity: [0.16, 0.42, 0.16], scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ) : null}
              <rect
                x={gate.x}
                y={gate.y}
                width={gate.w}
                height={gate.h}
                rx="14"
                fill={fill}
                opacity={activeGate === gate.key ? 0.72 : 0.42}
                stroke="rgba(255,255,255,0.55)"
              />
              <text
                x={gate.x + gate.w / 2}
                y={gate.y + gate.h / 2 + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="13"
                fontWeight="800"
              >
                {gate.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Selected gate</p>
        <p className="mt-1 text-sm font-semibold text-white">
          {active.label}: {activeWait} min wait
        </p>
      </div>
    </div>
  );
}
