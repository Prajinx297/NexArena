import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Check,
  Clock3,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  Ticket,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import type { Alert } from "../../types";
import { GlassPanel, MetricChip, MiniLabel, PulseDot, SectionIntro, StatStack, StatusBadge } from "./DashboardPrimitives";

export interface FanZone {
  id: string;
  name: string;
  kind: "gate" | "stand" | "section";
  crowd: number;
  wait: number;
  status: "Low" | "Medium" | "Critical";
  position: { top: string; left: string; width: string; height: string; rotate?: number };
}

interface TicketInfo {
  id: string;
  seat: string;
  gate: string;
  status: string;
}

interface EventSummary {
  name: string;
  stadium: string;
  city: string;
  date: string;
}

interface FriendResult {
  name: string;
  ticketId: string;
  zoneId: string;
  locationLabel: string;
  status: string;
}

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
  prepMinutes: number;
  pickup: string;
  tag: string;
}

const FOOD_MENU: FoodItem[] = [
  {
    id: "food-1",
    name: "Firecracker Burger",
    price: 229,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 8,
    pickup: "North Concourse, Bay 2",
    tag: "Fastest",
  },
  {
    id: "food-2",
    name: "Loaded Nacho Box",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 6,
    pickup: "East Stand Express",
    tag: "Top rated",
  },
  {
    id: "food-3",
    name: "Hydration Combo",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 4,
    pickup: "Gate B Cool Bar",
    tag: "Queue skip",
  },
];

export function FanHero({
  event,
  ticket,
  bestGate,
  onRefresh,
}: {
  event: EventSummary;
  ticket: TicketInfo;
  bestGate: FanZone | null;
  onRefresh: () => void;
}) {
  return (
    <GlassPanel className="relative overflow-hidden p-6 md:p-8" glow="blue">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_24%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.05),transparent)] md:block" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label="Live arrival window" tone="red" />
            <MiniLabel text={event.city} icon={<MapPin className="h-3.5 w-3.5 text-sky-300" />} />
            <MiniLabel text={event.date} icon={<Clock3 className="h-3.5 w-3.5 text-sky-300" />} />
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-app-muted">Fan dashboard</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {event.name}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              Premium live operations for {event.stadium}. Follow the best entry, track your squad, and skip concession queues without leaving the flow of the event.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricChip label="Ticket ID" value={ticket.id} tone="blue" />
            <MetricChip label="Assigned gate" value={ticket.gate} tone="emerald" />
            <MetricChip label="Seat" value={ticket.seat} tone="neutral" />
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Best gate right now</p>
              <button
                onClick={onRefresh}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-semibold text-white">{bestGate?.name ?? "Calculating"}</p>
                <p className="mt-2 text-sm text-slate-300">
                  Recommended Gate: {bestGate?.name ?? "Stand by"} ({bestGate ? `${bestGate.wait} min wait` : "live sync"})
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200">Status</p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">Optimal</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatStack label="Ticket health" value="Verified" caption="Entry pass active" accent="emerald" />
            <StatStack label="Live route" value={bestGate ? `${bestGate.wait}m` : "--"} caption="Fastest inbound ETA" accent="amber" />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function LiveAnalyticsRow({
  bestGate,
  recommendation,
  overallCrowd,
  averageWait,
}: {
  bestGate: FanZone | null;
  recommendation: string;
  overallCrowd: number;
  averageWait: number;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1.1fr_1.3fr]">
      <GlassPanel className="overflow-hidden" glow="blue">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Crowd density</p>
            <p className="mt-3 font-display text-4xl font-semibold text-white">{overallCrowd}%</p>
            <p className="mt-2 text-sm text-slate-300">Venue-wide occupancy calculated from live ingress and stand telemetry.</p>
          </div>
          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
            <PulseDot tone="blue" />
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#0ea5e9,#22c55e)]"
            initial={{ width: "0%" }}
            animate={{ width: `${overallCrowd}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </GlassPanel>

      <GlassPanel glow="amber">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Wait prediction</p>
            <p className="mt-3 font-display text-4xl font-semibold text-white">{averageWait} min</p>
            <p className="mt-2 text-sm text-slate-300">
              Balanced estimate across active entries. {bestGate ? `${bestGate.name} remains the fastest lane.` : "Optimizing gate routes."}
            </p>
          </div>
          <Clock3 className="h-10 w-10 text-amber-300" />
        </div>
      </GlassPanel>

      <GlassPanel className="relative overflow-hidden border-sky-300/15" glow="emerald">
        <div className="absolute inset-y-4 right-4 w-28 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
            <Sparkles className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-app-muted">AI recommendation</p>
            <p className="font-display text-2xl font-semibold text-white">Move early, move smart</p>
            <p className="max-w-xl text-sm leading-6 text-slate-300">{recommendation}</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

export function StadiumMapCard({
  zones,
  selectedZoneId,
  highlightedZoneId,
  onZoneSelect,
  friendResult,
}: {
  zones: FanZone[];
  selectedZoneId: string | null;
  highlightedZoneId?: string | null;
  onZoneSelect: (zoneId: string) => void;
  friendResult: FriendResult | null;
}) {
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? zones[0] ?? null;

  return (
    <GlassPanel className="grid gap-5 xl:grid-cols-[1.4fr_0.78fr]">
      <div className="space-y-4">
        <SectionIntro
          eyebrow="Interactive stadium map"
          title="Tap any gate or stand for live status"
          description="The map combines live density, queue predictions, and friend-tracking overlays into a single, presentation-ready control layer."
        />
        <div className="relative min-h-[460px] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_34%),linear-gradient(180deg,rgba(5,10,20,0.96),rgba(2,6,23,0.94))] p-4">
          <div className="absolute inset-5 rounded-[32px] border border-white/6" />
          <div className="absolute inset-[15%] rounded-[28%] border border-sky-400/12 bg-sky-400/[0.03]" />
          <div className="absolute inset-[22%] rounded-[26px] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(15,23,42,0.3))]" />
          <div className="absolute left-1/2 top-1/2 h-[46%] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-emerald-400/15" />
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/20" />
          <div className="absolute left-1/2 top-1/2 h-[2px] w-[44%] -translate-x-1/2 -translate-y-1/2 bg-emerald-400/15" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-app-muted">
            Pitch
          </div>

          {zones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            const isHighlighted = zone.id === highlightedZoneId;
            const statusClass =
              zone.status === "Critical"
                ? "from-red-500/50 to-red-500/18 border-red-300/35"
                : zone.status === "Medium"
                  ? "from-amber-400/50 to-amber-400/18 border-amber-200/30"
                  : "from-emerald-400/50 to-emerald-400/18 border-emerald-200/30";

            return (
              <motion.button
                key={zone.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onZoneSelect(zone.id)}
                className={`absolute overflow-hidden rounded-[26px] border bg-gradient-to-br p-3 text-left transition-all ${statusClass} ${
                  isSelected ? "shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_24px_50px_rgba(15,23,42,0.35)]" : "opacity-90 hover:opacity-100"
                } ${isHighlighted ? "ring-2 ring-sky-300/80 shadow-[0_0_45px_rgba(56,189,248,0.34)]" : ""}`}
                style={{
                  top: zone.position.top,
                  left: zone.position.left,
                  width: zone.position.width,
                  height: zone.position.height,
                  transform: zone.position.rotate ? `rotate(${zone.position.rotate}deg)` : undefined,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
                <div className="relative flex h-full flex-col justify-between">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/75">{zone.kind}</p>
                  <div>
                    <p className="font-display text-lg font-semibold text-white">{zone.name}</p>
                    <p className="mt-1 text-xs text-white/70">{zone.wait} min wait</p>
                  </div>
                  {isHighlighted ? (
                    <div className="absolute right-2 top-2 rounded-full border border-sky-300/50 bg-sky-300/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100">
                      Friend
                    </div>
                  ) : null}
                </div>
              </motion.button>
            );
          })}

          {friendResult ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 rounded-2xl border border-sky-300/20 bg-slate-950/70 px-4 py-3 backdrop-blur-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-sky-200">Live friend locate</p>
              <p className="mt-2 text-sm font-semibold text-white">{friendResult.name}</p>
              <p className="text-xs text-slate-300">{friendResult.status}</p>
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Zone detail</p>
          {selectedZone ? (
            <motion.div key={selectedZone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-semibold text-white">{selectedZone.name}</p>
                  <p className="mt-1 text-sm text-slate-300">Live crowd, wait, and severity signal for this section.</p>
                </div>
                <StatusBadge
                  label={selectedZone.status}
                  tone={selectedZone.status === "Critical" ? "red" : selectedZone.status === "Medium" ? "amber" : "emerald"}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <MetricChip label="Crowd" value={`${selectedZone.crowd}%`} tone={selectedZone.status === "Critical" ? "red" : "blue"} />
                <MetricChip label="Predicted wait" value={`${selectedZone.wait} min`} tone="amber" />
                <MetricChip label="Operating state" value={selectedZone.status} tone={selectedZone.status === "Low" ? "emerald" : "amber"} />
              </div>
            </motion.div>
          ) : (
            <p className="mt-4 text-sm text-app-muted">Select a zone to inspect its live data.</p>
          )}
        </div>

        <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Recommendations</p>
          <div className="mt-4 space-y-3">
            {zones
              .slice()
              .sort((left, right) => left.wait - right.wait)
              .slice(0, 3)
              .map((zone, index) => (
                <div key={zone.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{zone.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {index === 0 ? "Fastest entry right now" : "Alternative route"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold text-white">{zone.wait}m</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-app-muted">ETA</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function FoodOrderingCard({
  onCheckout,
}: {
  onCheckout: (itemCount: number, pickup: string, eta: number) => void;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = FOOD_MENU.filter((item) => cart[item.id]).map((item) => ({
    ...item,
    quantity: cart[item.id],
  }));

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAdd = (itemId: string) => {
    setCart((current) => ({ ...current, [itemId]: (current[itemId] ?? 0) + 1 }));
  };

  const handleCheckout = () => {
    if (!cartItems.length) return;
    setIsSubmitting(true);
    const totalPrep = cartItems.reduce((sum, item) => sum + item.prepMinutes * item.quantity, 0);
    const pickup = cartItems[0].pickup;
    window.setTimeout(() => {
      onCheckout(cartItems.reduce((sum, item) => sum + item.quantity, 0), pickup, Math.max(6, totalPrep));
      setCart({});
      setIsSubmitting(false);
    }, 1400);
  };

  return (
    <GlassPanel className="space-y-5" glow="amber">
      <SectionIntro
        eyebrow="Food ordering"
        title="Order food and skip queue"
        description="Place your order from the dashboard and pick it up from the fastest service point once it is ready."
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
          {FOOD_MENU.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="overflow-hidden rounded-[26px] border border-white/10 bg-black/20"
            >
              <div className="h-36 overflow-hidden">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.pickup}</p>
                  </div>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                    {item.tag}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-display text-2xl font-semibold text-white">Rs {item.price}</p>
                  <button
                    onClick={() => handleAdd(item.id)}
                    className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <ShoppingBag className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Cart</p>
              <p className="font-display text-2xl font-semibold text-white">{cartItems.length} items</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {cartItems.length ? (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">Rs {item.price * item.quantity}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-app-muted">
                Add snacks to unlock instant pickup checkout.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-white">Rs {subtotal}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!cartItems.length || isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#38bdf8,#0ea5e9)] px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                Preparing checkout
              </>
            ) : (
              <>
                <UtensilsCrossed className="h-4 w-4" />
                Checkout
              </>
            )}
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}

export function OrderConfirmationCard({
  order,
}: {
  order: { eta: number; pickup: string; itemCount: number } | null;
}) {
  if (!order) return null;

  return (
    <GlassPanel className="border-emerald-400/15" glow="emerald">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
            <Check className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Order confirmed</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">Pickup in {order.eta} minutes</p>
            <p className="mt-2 text-sm text-slate-300">
              {order.itemCount} item{order.itemCount > 1 ? "s" : ""} headed to {order.pickup}.
            </p>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-app-muted">Pickup location</p>
          <p className="mt-2 text-lg font-semibold text-white">{order.pickup}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

export function FriendFinderCard({
  zones,
  onFriendLocated,
}: {
  zones: FanZone[];
  onFriendLocated: (result: FriendResult | null) => void;
}) {
  const [name, setName] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<FriendResult | null>(null);

  const mockFriends = useMemo(
    () =>
      zones.slice(0, 5).map((zone, index) => ({
        name: ["Aarav", "Diya", "Kiran", "Rhea", "Kabir"][index],
        ticketId: `NX-${zone.id.toUpperCase().slice(0, 3)}${index + 1}7`,
        zoneId: zone.id,
        locationLabel: zone.name,
        status: zone.kind === "gate" ? `At ${zone.name} (Entering)` : `In ${zone.name} (Seated)`,
      })),
    [zones],
  );

  useEffect(() => {
    onFriendLocated(result);
  }, [onFriendLocated, result]);

  const handleSearch = () => {
    setIsSearching(true);
    window.setTimeout(() => {
      const normalizedName = name.trim().toLowerCase();
      const normalizedTicket = ticketId.trim().toLowerCase();
      const found =
        mockFriends.find(
          (friend) =>
            (!normalizedName || friend.name.toLowerCase().includes(normalizedName)) &&
            (!normalizedTicket || friend.ticketId.toLowerCase().includes(normalizedTicket)),
        ) ?? null;

      setResult(found);
      setIsSearching(false);
    }, 1100);
  };

  return (
    <GlassPanel className="space-y-5" glow="blue">
      <SectionIntro
        eyebrow="Find your friend"
        title="Locate people inside the stadium"
        description="Search by name and ticket ID, then mirror the result directly on the interactive venue map."
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
          <label className="text-[11px] uppercase tracking-[0.24em] text-app-muted">Friend name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Aarav"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/40"
          />
          <label className="mt-4 block text-[11px] uppercase tracking-[0.24em] text-app-muted">Ticket ID</label>
          <input
            value={ticketId}
            onChange={(event) => setTicketId(event.target.value)}
            placeholder="NX-GAT17"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/40"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || (!name.trim() && !ticketId.trim())}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-sky-100/20 border-t-sky-100"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                Searching
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Locate friend
              </>
            )}
          </button>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <Users className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Live result</p>
              <p className="font-display text-2xl font-semibold text-white">{result ? result.name : "No friend selected"}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.ticketId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-5 space-y-3"
              >
                <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-sky-100">Current location</p>
                  <p className="mt-2 text-xl font-semibold text-white">{result.locationLabel}</p>
                  <p className="mt-2 text-sm text-slate-300">{result.status}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricChip label="Ticket ID" value={result.ticketId} tone="blue" />
                  <MetricChip label="Map marker" value="Synced" tone="emerald" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-app-muted"
              >
                Search results will appear here and auto-highlight on the stadium map.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassPanel>
  );
}

export function AlertsTicker({
  alerts,
}: {
  alerts: Alert[];
}) {
  return (
    <GlassPanel className="overflow-hidden py-4" glow="red">
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-200">
          <Bell className="h-4 w-4" />
          Live alerts
        </div>
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap text-sm text-slate-200"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            {[...alerts, ...alerts].map((alert, index) => (
              <span key={`${alert.id}-${index}`} className="inline-flex items-center gap-3">
                <PulseDot tone={alert.severity === "critical" ? "red" : alert.severity === "high" ? "amber" : "blue"} />
                {alert.title}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function buildFanZones(waitTimes: Record<string, number> | null, crowdData: Record<string, number> | null): FanZone[] {
  const zoneBlueprint = [
    { id: "gate-a", name: "Gate A", kind: "gate" as const, crowdKey: "Gate A (North)", waitKey: "Gate A", position: { top: "7%", left: "31%", width: "17%", height: "18%" } },
    { id: "gate-b", name: "Gate B", kind: "gate" as const, crowdKey: "Gate C (East)", waitKey: "Gate B", position: { top: "27%", left: "77%", width: "15%", height: "20%" } },
    { id: "gate-c", name: "Gate C", kind: "gate" as const, crowdKey: "Gate E (South)", waitKey: "Gate C", position: { top: "74%", left: "40%", width: "18%", height: "18%" } },
    { id: "gate-d", name: "Gate D", kind: "gate" as const, crowdKey: "Gate G (West)", waitKey: "Gate D", position: { top: "28%", left: "7%", width: "15%", height: "20%" } },
    { id: "stand-east", name: "Stand East", kind: "stand" as const, crowdKey: "Gate C (East)", waitKey: "Stand East", position: { top: "24%", left: "62%", width: "17%", height: "46%" } },
    { id: "stand-west", name: "Stand West", kind: "stand" as const, crowdKey: "Gate G (West)", waitKey: "Stand West", position: { top: "24%", left: "21%", width: "17%", height: "46%" } },
    { id: "north-terrace", name: "North Terrace", kind: "section" as const, crowdKey: "Gate A (North)", waitKey: "North Terrace", position: { top: "8%", left: "44%", width: "20%", height: "17%" } },
    { id: "south-terrace", name: "South Terrace", kind: "section" as const, crowdKey: "Gate E (South)", waitKey: "South Terrace", position: { top: "73%", left: "44%", width: "20%", height: "17%" } },
  ];

  return zoneBlueprint.map((zone, index) => {
    const fallbackCrowd = [44, 26, 58, 38, 72, 61, 49, 57][index];
    const fallbackWait = [12, 8, 15, 10, 6, 9, 11, 13][index];
    const crowd = crowdData?.[zone.crowdKey] ?? fallbackCrowd;
    const wait = waitTimes?.[zone.waitKey] ?? fallbackWait;
    return {
      id: zone.id,
      name: zone.name,
      kind: zone.kind,
      crowd,
      wait,
      position: zone.position,
      status: crowd > 76 ? "Critical" : crowd > 55 ? "Medium" : "Low",
    };
  });
}

export function deriveFanRecommendation(bestGate: FanZone | null, ticketGate: string) {
  if (!bestGate) {
    return "Optimizing your route now using current gate load, ingress speed, and stand occupancy.";
  }

  if (bestGate.name === ticketGate) {
    return `${bestGate.name} is aligned with your ticket and currently has the lightest flow. Keep your current route for the smoothest entry.`;
  }

  return `${bestGate.name} is currently ${Math.max(1, bestGate.wait - 2)} minutes faster than your assigned route. Consider rerouting now to reduce queue time before the next arrival spike.`;
}

export function createFallbackFriendResult(zone: FanZone): FriendResult {
  return {
    name: "Aarav",
    ticketId: `NX-${zone.id.toUpperCase().slice(0, 3)}17`,
    zoneId: zone.id,
    locationLabel: zone.name,
    status: zone.kind === "gate" ? `At ${zone.name} (Entering)` : `In ${zone.name} (Seated)`,
  };
}
