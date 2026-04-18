import { motion } from "motion/react";
import {
  AlertTriangle,
  Camera,
  RadioTower,
  Send,
  ShieldAlert,
  Siren,
  Zap,
} from "lucide-react";
import type { Alert } from "../../types";
import { GlassPanel, MetricChip, MiniLabel, SectionIntro, StatusBadge } from "./DashboardPrimitives";

export interface HostZone {
  id: string;
  label: string;
  value: number;
  incidents: number;
  status: "Clear" | "Watch" | "Critical";
}

export interface CameraFeedData {
  id: string;
  label: string;
  value: number;
  note: string;
}

export function HostHero({
  eventName,
  stadium,
  liveState,
}: {
  eventName: string;
  stadium: string;
  liveState: string;
}) {
  return (
    <GlassPanel className="relative overflow-hidden p-6 md:p-8" glow="blue">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.16),transparent_24%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label={liveState} tone="red" />
            <MiniLabel text={stadium} icon={<ShieldAlert className="h-3.5 w-3.5 text-sky-300" />} />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.34em] text-app-muted">Host command center</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">NexArena operations console</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Oversee crowd behavior, camera intelligence, and emergency comms for {eventName} from a single premium operations surface.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricChip label="Threat monitor" value="Active" tone="red" />
          <MetricChip label="Response mesh" value="Synchronized" tone="emerald" />
          <MetricChip label="Signal latency" value="12 ms" tone="blue" />
        </div>
      </div>
    </GlassPanel>
  );
}

export function HostHeatmapCard({
  zones,
}: {
  zones: HostZone[];
}) {
  return (
    <GlassPanel className="space-y-5" glow="blue">
      <SectionIntro
        eyebrow="Heatmap crowd intelligence"
        title="Live venue pressure map"
        description="Each tile blends crowd concentration, incident count, and response urgency so the operations team can spot hotspots instantly."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {zones.map((zone) => {
          const statusTone = zone.status === "Critical" ? "red" : zone.status === "Watch" ? "amber" : "emerald";
          const zoneClass =
            zone.status === "Critical"
              ? "from-red-500/40 via-red-500/18 to-transparent border-red-400/30"
              : zone.status === "Watch"
                ? "from-amber-400/40 via-amber-400/18 to-transparent border-amber-300/25"
                : "from-emerald-400/35 via-emerald-400/16 to-transparent border-emerald-300/25";

          return (
            <motion.div
              key={zone.id}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-[28px] border bg-[linear-gradient(145deg,var(--tw-gradient-stops))] p-5 ${zoneClass}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%)]" />
              <div className="relative space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/65">Zone</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-white">{zone.label}</p>
                  </div>
                  <StatusBadge label={zone.status} tone={statusTone} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/65">Occupancy</p>
                    <p className="mt-2 font-display text-4xl font-semibold text-white">{zone.value}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/65">Incidents</p>
                    <p className="mt-2 font-display text-4xl font-semibold text-white">{zone.incidents}</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/25">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${zone.value}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-white/80"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

export function HostAlertsCard({
  alerts,
  onResolve,
}: {
  alerts: Alert[];
  onResolve: (id: string) => void;
}) {
  return (
    <GlassPanel className="space-y-4" glow="red">
      <SectionIntro
        eyebrow="Escalation board"
        title="Prioritized alert queue"
        description="Color-coded escalations help the team respond quickly without flooding the interface."
      />
      <div className="space-y-3">
        {alerts.length ? (
          alerts.map((alert) => {
            const tone =
              alert.severity === "critical"
                ? "border-red-400/25 bg-red-400/10"
                : alert.severity === "high"
                  ? "border-amber-300/20 bg-amber-300/10"
                  : "border-sky-300/20 bg-sky-300/10";

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-[24px] border p-4 ${tone}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-white" />
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{alert.description}</p>
                  </div>
                  <button
                    onClick={() => onResolve(alert.id)}
                    className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/35"
                  >
                    Resolve
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-app-muted">
            All escalation channels are currently clear.
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

export function CctvWallCard({
  feeds,
}: {
  feeds: CameraFeedData[];
}) {
  return (
    <GlassPanel className="space-y-5" glow="blue">
      <SectionIntro
        eyebrow="CCTV wall"
        title="Visual surveillance grid"
        description="Designed like a real command center: clean overlays, occupancy labels, and subtle scan-line motion that looks strong on screen recordings."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {feeds.map((feed) => {
          const statusTone = feed.value > 78 ? "bg-red-400" : feed.value > 55 ? "bg-amber-300" : "bg-emerald-300";

          return (
            <motion.article
              key={feed.id}
              whileHover={{ y: -4 }}
              className="group relative aspect-video overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,14,28,0.98),rgba(15,23,42,0.86))]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:100%_18px]" />
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              </div>
              <div className="relative flex h-full flex-col justify-between p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                    {feed.id}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                    <span className={`h-2 w-2 rounded-full ${statusTone}`} />
                    Live
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white">{feed.label}</p>
                  <p className="mt-1 text-xs text-slate-300">{feed.note}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-slate-200">
                    <Camera className="h-3.5 w-3.5 text-sky-300" />
                    Feed active
                  </div>
                  <p className="font-display text-2xl font-semibold text-white">{feed.value}%</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </GlassPanel>
  );
}

export function BroadcastComposer({
  message,
  severity,
  target,
  onMessageChange,
  onSeverityChange,
  onTargetChange,
  onSend,
  sending,
}: {
  message: string;
  severity: string;
  target: string;
  onMessageChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
}) {
  return (
    <GlassPanel className="space-y-5" glow="amber">
      <SectionIntro
        eyebrow="Broadcast"
        title="Send a zone-targeted message"
        description="High-confidence controls with clear defaults help operators act quickly during spikes."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <select
          value={severity}
          onChange={(event) => onSeverityChange(event.target.value)}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/40"
        >
          <option value="info">Info</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={target}
          onChange={(event) => onTargetChange(event.target.value)}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/40"
        >
          <option value="all">All fans</option>
          <option value="North Gate">North Gate</option>
          <option value="East Stand">East Stand</option>
          <option value="South Gate">South Gate</option>
          <option value="West Stand">West Stand</option>
        </select>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          Smart routing will prioritize nearby displays, handheld staff, and fan notifications.
        </div>
      </div>

      <textarea
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder="Type a concise operational message..."
        className="min-h-28 w-full rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/40"
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSend}
          disabled={!message.trim() || sending}
          className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#38bdf8,#0ea5e9)] px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <RadioTower className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending..." : "Dispatch broadcast"}
        </button>
        <button
          onClick={() => onMessageChange("Emergency teams are redeploying. Follow nearest staff instructions and use the highlighted alternate route.")}
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-3 font-semibold text-red-100 transition hover:bg-red-400/20"
        >
          <Siren className="mr-2 inline h-4 w-4" />
          Emergency preset
        </button>
        <button
          onClick={() => onMessageChange("Operations note: Gate B is recommended for the next 10 minutes due to reduced queue pressure.")}
          className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-3 font-semibold text-amber-100 transition hover:bg-amber-300/20"
        >
          <Zap className="mr-2 inline h-4 w-4" />
          Queue reroute preset
        </button>
      </div>
    </GlassPanel>
  );
}
