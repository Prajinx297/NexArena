import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../ui/utils";

export function DashboardShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-app-bg text-app-text", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:90px_90px]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-app-muted">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-app-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function GlassPanel({
  children,
  className = "",
  glow = "none",
}: {
  children: ReactNode;
  className?: string;
  glow?: "none" | "blue" | "emerald" | "amber" | "red";
}) {
  const glowClass =
    glow === "blue"
      ? "shadow-[0_20px_60px_rgba(14,165,233,0.14)]"
      : glow === "emerald"
        ? "shadow-[0_20px_60px_rgba(16,185,129,0.16)]"
        : glow === "amber"
          ? "shadow-[0_20px_60px_rgba(245,158,11,0.14)]"
          : glow === "red"
            ? "shadow-[0_20px_60px_rgba(239,68,68,0.14)]"
            : "shadow-[0_18px_48px_rgba(2,6,23,0.45)]";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-2xl md:p-6",
        glowClass,
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function MetricChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "blue" | "emerald" | "amber" | "red";
}) {
  const toneClass =
    tone === "blue"
      ? "border-sky-400/20 bg-sky-400/10 text-sky-100"
      : tone === "emerald"
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
        : tone === "amber"
          ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
          : tone === "red"
            ? "border-red-400/20 bg-red-400/10 text-red-100"
            : "border-white/10 bg-white/5 text-slate-100";

  return (
    <div className={cn("rounded-2xl border px-4 py-3", toneClass)}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function PulseDot({ tone = "blue" }: { tone?: "blue" | "emerald" | "amber" | "red" }) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-400"
      : tone === "amber"
        ? "bg-amber-400"
        : tone === "red"
          ? "bg-red-400"
          : "bg-sky-400";

  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", toneClass)} />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", toneClass)} />
    </span>
  );
}

export function StatusBadge({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "emerald" | "amber" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
        : tone === "red"
          ? "border-red-400/25 bg-red-400/10 text-red-300"
          : "border-sky-400/25 bg-sky-400/10 text-sky-300";

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]", toneClass)}>
      <PulseDot tone={tone} />
      {label}
    </span>
  );
}

export function StatStack({
  label,
  value,
  caption,
  accent = "blue",
}: {
  label: string;
  value: string;
  caption?: string;
  accent?: "blue" | "emerald" | "amber";
}) {
  const accentClass =
    accent === "emerald"
      ? "from-emerald-400/18 to-emerald-400/0"
      : accent === "amber"
        ? "from-amber-400/18 to-amber-400/0"
        : "from-sky-400/18 to-sky-400/0";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-black/20 p-4">
      <div className={cn("absolute inset-x-0 top-0 h-16 bg-gradient-to-b", accentClass)} />
      <p className="relative text-[11px] uppercase tracking-[0.24em] text-app-muted">{label}</p>
      <p className="relative mt-3 font-display text-3xl font-semibold text-white">{value}</p>
      {caption ? <p className="relative mt-2 text-sm text-app-muted">{caption}</p> : null}
    </div>
  );
}

export function MiniLabel({
  icon,
  text,
}: {
  icon?: ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-app-muted">
      {icon}
      {text}
    </div>
  );
}
