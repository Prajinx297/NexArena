import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Settings, Ticket, TrendingUp, Wifi } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { ChatbotWidget } from "../components/ChatbotWidget";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { ErrorBanner } from "../components/ErrorBanner";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import {
  AlertsTicker,
  FanHero,
  FriendFinderCard,
  LiveAnalyticsRow,
  FoodOrderingCard,
  OrderConfirmationCard,
  StadiumMapCard,
  buildFanZones,
  createFallbackFriendResult,
  deriveFanRecommendation,
  type FanZone,
} from "../components/dashboard/FanDashboardSections";
import { DashboardShell, GlassPanel, SectionIntro } from "../components/dashboard/DashboardPrimitives";
import { ConcessionPanel } from "../components/ConcessionPanel";
import { GateDensityRing } from "../components/GateDensityRing";
import { JourneyTimeline, type JourneyEvent } from "../components/JourneyTimeline";
import { OnboardingTour } from "../components/OnboardingTour";
import { PreferencesDrawer } from "../components/PreferencesDrawer";
import { StadiumMap } from "../components/StadiumMap";
import { useToast } from "../context/ToastContext";
import { useWebSocket } from "../hooks/useWebSocket";
import type { Alert, Event, LiveStadiumState, UserPreferences } from "../types";
import { getAlertsForEvent, getEventById, getRecommendations, getWaitTime, savePreferences } from "../utils/api";

const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? import.meta.env.VITE_WS_BASE_URL ?? import.meta.env.VITE_API_URL?.replace("https://", "wss://").replace("http://", "ws://") ?? import.meta.env.VITE_API_BASE_URL?.replace("https://", "wss://").replace("http://", "ws://");

interface RecommendationResponse {
  recommended_gate?: string;
  instruction?: string;
}

interface TicketInfo {
  id: string;
  seat: string;
  gate: string;
  status: string;
}

const defaultAlerts: Alert[] = [
  {
    id: "fallback-1",
    title: "Ingress update: Gate B currently fastest for general admission",
    description: "AI routing has shifted the recommendation due to lower queue pressure on the east side.",
    severity: "info",
    timestamp: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    title: "Food pickup lanes active in North Concourse",
    description: "Order ahead to skip the queue and collect at Bay 2.",
    severity: "low",
    timestamp: new Date().toISOString(),
  },
];

function createTicket(eventId: string): TicketInfo {
  const suffix = eventId.slice(-4).toUpperCase().padEnd(4, "X");
  return {
    id: `NX-${suffix}-A12`,
    seat: "Section B, Row 12, Seat 4",
    gate: "Gate B",
    status: "active",
  };
}

export function DashboardPage() {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [waitTimes, setWaitTimes] = useState<Record<string, number> | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [crowdData, setCrowdData] = useState<Record<string, number> | null>(null);
  const [concessions, setConcessions] = useState<LiveStadiumState["concessions"] | undefined>();
  const [surgeWarning, setSurgeWarning] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ticket, setTicket] = useState<TicketInfo>(() => createTicket(eventId));
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [friendResult, setFriendResult] = useState<{
    name: string;
    ticketId: string;
    zoneId: string;
    locationLabel: string;
    status: string;
  } | null>(null);
  const [orderState, setOrderState] = useState<{ eta: number; pickup: string; itemCount: number } | null>(null);
  const [tourRestart, setTourRestart] = useState(0);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({ notifications: true, sound: false });
  const [timelineEvents, setTimelineEvents] = useState<JourneyEvent[]>(() => [
    {
      id: `entered-${eventId}`,
      label: "Dashboard entered",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tone: "blue",
    },
  ]);

  const { data: wsData, status: wsStatus } = useWebSocket<LiveStadiumState>(`${WS_BASE_URL}/crowd/${eventId}`);

  useEffect(() => {
    document.title = `${eventDetails?.name ?? "Fan Dashboard"} | NexArena`;
  }, [eventDetails?.name]);

  useEffect(() => {
    if (wsData?.heat_map) {
      setCrowdData(wsData.heat_map);
      setWaitTimes(wsData.wait_times ?? null);
      setConcessions(wsData.concessions);
      if (wsData.surge_warning) {
        setSurgeWarning(wsData.surge_warning);
        setAlerts((current) => [wsData.surge_warning as Alert, ...current.filter((alert) => alert.id !== wsData.surge_warning?.id)].slice(0, 8));
        setTimelineEvents((current) => [
          {
            id: `surge-${wsData.surge_warning?.zone}-${wsData.timestamp}`,
            label: wsData.surge_warning?.title ?? "Surge warning received",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tone: "amber",
          },
          ...current,
        ]);
      }
    }
  }, [wsData]);

  useEffect(() => {
    setTicket(createTicket(eventId));
  }, [eventId]);

  const fetchData = async () => {
    setFetchError(null);

    try {
      const [waitResponse, recommendResponse, matchedEvent, nextAlerts] = await Promise.all([
        getWaitTime(eventId),
        getRecommendations(eventId),
        getEventById(eventId),
        getAlertsForEvent(eventId),
      ]);

      setWaitTimes(waitResponse.wait_times ?? null);
      setRecommendation(Array.isArray(recommendResponse) ? recommendResponse[0] ?? null : recommendResponse ?? null);
      setAlerts(nextAlerts);
      if (nextAlerts.length) {
        setTimelineEvents((current) => [
          {
            id: `alerts-${nextAlerts[0].id}-${Date.now()}`,
            label: `Alert received: ${nextAlerts[0].title}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tone: nextAlerts[0].type === "surge" ? "amber" : "red",
          },
          ...current,
        ]);
      }

      setEventDetails(matchedEvent);
    } catch (error: any) {
      setFetchError(error?.message ?? "Failed to load live dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = window.setInterval(fetchData, 9000);
    return () => window.clearInterval(intervalId);
  }, [eventId]);

  const zones = buildFanZones(waitTimes, crowdData);
  const bestGate = zones
    .filter((zone) => zone.kind === "gate")
    .sort((left, right) => left.wait - right.wait)[0] ?? null;
  const displayedAlerts = alerts.length ? alerts : defaultAlerts;
  const densitySource = wsData?.densities ?? crowdData ?? {};
  const waitSource = wsData?.wait_times ?? waitTimes ?? {};
  const averageWait = zones.length
    ? Math.round(zones.reduce((sum, zone) => sum + zone.wait, 0) / zones.length)
    : 0;
  const overallCrowd = zones.length
    ? Math.round(zones.reduce((sum, zone) => sum + zone.crowd, 0) / zones.length)
    : 0;
  const aiMessage =
    recommendation?.instruction ?? deriveFanRecommendation(bestGate, ticket.gate);

  useEffect(() => {
    if (!bestGate) return;
    setTimelineEvents((current) => [
      {
        id: `rec-${bestGate.id}-${bestGate.wait}`,
        label: `AI recommends ${bestGate.name} (${bestGate.wait} min)`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tone: "emerald",
      },
      ...current,
    ]);
  }, [bestGate?.id, bestGate?.wait]);

  useEffect(() => {
    if (!selectedZoneId && zones.length) {
      setSelectedZoneId(bestGate?.id ?? zones[0].id);
    }
  }, [bestGate, selectedZoneId, zones]);

  useEffect(() => {
    if (!friendResult && zones.length) {
      setFriendResult(createFallbackFriendResult(zones[1] ?? zones[0]));
    }
  }, [friendResult, zones]);

  if (loading && !eventDetails && !crowdData && !waitTimes) {
    return <DashboardSkeleton />;
  }

  const eventSummary = {
    name: eventDetails?.name ?? "Championship Night",
    stadium: eventDetails?.stadium ?? "NexArena Stadium",
    city: eventDetails?.city ?? "Smart City",
    date: eventDetails?.date ?? "Tonight",
  };

  return (
    <DashboardShell>
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-app-muted">
                <Link to="/" className="hover:text-white">Home</Link>
                <span>&gt;</span>
                <Link to="/events" className="hover:text-white">Events</Link>
                <span>&gt;</span>
                <button type="button" onClick={() => navigate(`/dashboard/${eventId}`)} className="hover:text-white">
                  {eventSummary.name}
                </button>
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Premium fan UI</p>
              <p className="mt-1 text-sm text-slate-300">Built for live wayfinding, food, and social coordination.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ConnectionStatus status={wsStatus} />
            <button
              type="button"
              onClick={() => {
                fetchData();
                showToast("Live dashboard refreshed", "info");
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setTourRestart((value) => value + 1)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              ? Restart tour
            </button>
            <button
              type="button"
              onClick={() => setPreferencesOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </button>
          </div>
        </div>

        {fetchError ? <ErrorBanner message={fetchError} onRetry={fetchData} /> : null}

        <FanHero
          event={eventSummary}
          ticket={ticket}
          bestGate={bestGate}
          onRefresh={() => {
            fetchData();
            showToast("Route recommendations updated", "success");
          }}
        />

        <AlertsTicker alerts={displayedAlerts} />

        <LiveAnalyticsRow
          bestGate={bestGate}
          recommendation={aiMessage}
          overallCrowd={overallCrowd}
          averageWait={averageWait}
        />

        {surgeWarning ? (
          <GlassPanel className="border-amber-300/25 bg-amber-300/10" glow="amber">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-amber-300/30 bg-amber-300/15 p-3">
                  <TrendingUp className="h-6 w-6 text-amber-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-100">Predictive surge detector</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-white">{surgeWarning.title}</p>
                  <p className="mt-2 text-sm text-slate-200">{surgeWarning.description}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Velocity</p>
                <p className="font-display text-2xl font-semibold text-white">+{surgeWarning.velocity ?? 0}%/tick</p>
              </div>
            </div>
          </GlassPanel>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <GlassPanel className="space-y-5" glow="blue">
            <SectionIntro
              eyebrow="Live gate intelligence"
              title="Animated gate density rings"
              description="Each SVG ring animates from live WebSocket density and uses green, amber, or red state coloring."
            />
            <GateDensityRing gates={densitySource} />
            <SectionIntro
              eyebrow="Stadium SVG"
              title="Top-down live gate map"
              description="Clickable gates update the tooltip, while the highest-density gate pulses for immediate operator-grade visibility."
            />
            <StadiumMap densities={densitySource} waitTimes={waitSource} />
            <SectionIntro
              eyebrow="Concessions"
              title="Live concession wait times"
              description="Food, drinks, and merch queues are streamed with the same live state as the gates."
            />
            <ConcessionPanel concessions={concessions} />
          </GlassPanel>
          <JourneyTimeline storageKey={`nexarena-journey-${eventId}`} events={timelineEvents} />
        </div>

        <StadiumMapCard
          zones={zones}
          selectedZoneId={selectedZoneId}
          highlightedZoneId={friendResult?.zoneId}
          onZoneSelect={(zoneId) => setSelectedZoneId(zoneId)}
          friendResult={friendResult}
        />

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <FoodOrderingCard
              onCheckout={(itemCount, pickup, eta) => {
                setOrderState({ itemCount, pickup, eta });
                showToast("Order confirmed and sent to pickup lane", "success");
              }}
            />
            <OrderConfirmationCard order={orderState} />
          </div>

          <div className="space-y-6">
            <FriendFinderCard
              zones={zones}
              onFriendLocated={(result) => {
                setFriendResult(result);
                if (result) {
                  setSelectedZoneId(result.zoneId);
                  showToast(`${result.name} located at ${result.locationLabel}`, "info");
                }
              }}
            />

            <GlassPanel className="space-y-4" glow="blue">
              <SectionIntro
                eyebrow="Smart fan layer"
                title="Everything important stays in view"
                description="Real-time notifications, route optimization, ticket details, and concierge actions are arranged for quick scanning during high-pressure moments."
              />
              <div className="grid gap-3">
                {[
                  {
                    icon: <Wifi className="h-4 w-4 text-sky-300" />,
                    title: "Live telemetry",
                    description: "Crowd, queue, and ingress state update automatically through the live feed connection.",
                  },
                  {
                    icon: <Ticket className="h-4 w-4 text-emerald-300" />,
                    title: "Ticket-aware guidance",
                    description: "Routes and recommendations stay aligned with your seat, gate, and current venue pressure.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">{item.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>

      <OnboardingTour restartSignal={tourRestart} />
      <PreferencesDrawer
        open={preferencesOpen}
        preferences={preferences}
        onClose={() => setPreferencesOpen(false)}
        onChange={async (nextPreferences) => {
          setPreferences(nextPreferences);
          try {
            await savePreferences(nextPreferences);
            showToast("Preferences saved", "success");
          } catch {
            showToast("Preferences saved locally", "info");
          }
        }}
      />
      <ChatbotWidget eventId={eventId} />
    </DashboardShell>
  );
}
