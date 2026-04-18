import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { ErrorBanner } from "../components/ErrorBanner";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import {
  BroadcastComposer,
  CctvWallCard,
  HostAlertsCard,
  HostHeatmapCard,
  HostHero,
  type CameraFeedData,
  type HostZone,
} from "../components/dashboard/HostDashboardSections";
import { DashboardShell, GlassPanel, SectionIntro } from "../components/dashboard/DashboardPrimitives";
import { useToast } from "../context/ToastContext";
import { useWebSocket } from "../hooks/useWebSocket";
import type { Alert, Event } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

const fallbackAlerts: Alert[] = [
  {
    id: "host-fallback-1",
    title: "East ingress rising above threshold",
    description: "Queue velocity is slowing near East Stand. Redirecting visitors toward Gate B is recommended.",
    severity: "high",
    timestamp: new Date().toISOString(),
    zone: "east",
  },
];

const hostZoneBlueprint = [
  { id: "north", label: "North Gate" },
  { id: "east", label: "East Stand" },
  { id: "south", label: "South Gate" },
  { id: "west", label: "West Stand" },
  { id: "vip", label: "VIP" },
  { id: "parking", label: "Parking" },
];

function deriveHostZones(densities: Record<string, number>): HostZone[] {
  return hostZoneBlueprint.map((zone, index) => {
    const value = densities[zone.id] ?? [42, 78, 36, 58, 24, 49][index];
    return {
      id: zone.id,
      label: zone.label,
      value,
      incidents: value > 80 ? 4 : value > 60 ? 2 : 0,
      status: value > 80 ? "Critical" : value > 55 ? "Watch" : "Clear",
    };
  });
}

function deriveCameraFeeds(zones: HostZone[]): CameraFeedData[] {
  return zones.map((zone, index) => ({
    id: `CAM-0${index + 1}`,
    label: zone.label,
    value: zone.value,
    note:
      zone.status === "Critical"
        ? "Escalation recommended. Crowd motion spikes detected."
        : zone.status === "Watch"
          ? "Moderate pressure. Keep zone on operator watch."
          : "Stable movement. No active intervention needed.",
  }));
}

export function HostDashboardPage() {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [densities, setDensities] = useState<Record<string, number>>({
    north: 48,
    east: 72,
    south: 34,
    west: 59,
    vip: 21,
    parking: 41,
  });
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSeverity, setBroadcastSeverity] = useState("info");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [sending, setSending] = useState(false);

  const { data: wsData, status: wsStatus } = useWebSocket<any>(`${WS_BASE_URL}/crowd/${eventId}`);

  useEffect(() => {
    if (wsData?.heat_map) {
      setDensities((current) => ({
        ...current,
        north: wsData.heat_map["Gate A (North)"] ?? current.north,
        east: wsData.heat_map["Gate C (East)"] ?? current.east,
        south: wsData.heat_map["Gate E (South)"] ?? current.south,
        west: wsData.heat_map["Gate G (West)"] ?? current.west,
      }));
    }
  }, [wsData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDensities((current) => ({
        north: Math.max(16, Math.min(95, current.north + Math.floor(Math.random() * 11 - 5))),
        east: Math.max(18, Math.min(95, current.east + Math.floor(Math.random() * 11 - 5))),
        south: Math.max(14, Math.min(95, current.south + Math.floor(Math.random() * 11 - 5))),
        west: Math.max(16, Math.min(95, current.west + Math.floor(Math.random() * 11 - 5))),
        vip: Math.max(5, Math.min(60, current.vip + Math.floor(Math.random() * 9 - 4))),
        parking: Math.max(18, Math.min(92, current.parking + Math.floor(Math.random() * 11 - 5))),
      }));
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    setFetchError(null);

    try {
      const [eventsResponse, alertsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/alerts`, { params: { event_id: eventId } }),
      ]);

      const matchedEvent = (eventsResponse.data.events ?? []).find((event: Event) => event.id === eventId) ?? null;
      setEventDetails(matchedEvent);
      setAlerts(alertsResponse.data.alerts ?? []);
    } catch (error: any) {
      setFetchError(error?.message ?? "Failed to load host dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(intervalId);
  }, [eventId]);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setSending(true);

    try {
      await axios.post(`${API_BASE_URL}/generate-alert`, {
        title: `[${broadcastSeverity.toUpperCase()}] ${broadcastTarget === "all" ? "All Zones" : broadcastTarget}`,
        description: broadcastMessage,
        severity: broadcastSeverity,
        event_id: eventId,
      });

      showToast("Broadcast dispatched to connected fans", "success");
      setBroadcastMessage("");
      fetchData();
    } catch {
      showToast("Unable to send broadcast", "error");
    } finally {
      setSending(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/alerts/${alertId}`, { params: { event_id: eventId } });
      setAlerts((current) => current.filter((alert) => alert.id !== alertId));
      showToast("Alert resolved", "info");
    } catch {
      showToast("Unable to resolve alert", "error");
    }
  };

  if (loading && !eventDetails && !alerts.length) {
    return <DashboardSkeleton />;
  }

  const hostZones = deriveHostZones(densities);
  const cameraFeeds = deriveCameraFeeds(hostZones);
  const activeAlerts = alerts.length ? alerts : fallbackAlerts;

  return (
    <DashboardShell>
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/host")}
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
                <button onClick={() => navigate(`/host-dashboard/${eventId}`)} className="hover:text-white">
                  {eventDetails?.name ?? "Event"}
                </button>
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-app-muted">Operations view</p>
              <p className="mt-1 text-sm text-slate-300">Designed as a modern command center with better hierarchy and response flow.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ConnectionStatus status={wsStatus} />
            <button
              onClick={() => {
                fetchData();
                showToast("Operations data refreshed", "info");
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {fetchError ? <ErrorBanner message={fetchError} onRetry={fetchData} /> : null}

        <HostHero
          eventName={eventDetails?.name ?? "Championship Night"}
          stadium={eventDetails?.stadium ?? "NexArena Stadium"}
          liveState="Live command center"
        />

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <HostHeatmapCard zones={hostZones} />
            <CctvWallCard feeds={cameraFeeds} />
          </div>

          <div className="space-y-6">
            <HostAlertsCard alerts={activeAlerts} onResolve={handleResolveAlert} />
            <GlassPanel className="space-y-4" glow="blue">
              <SectionIntro
                eyebrow="Response summary"
                title="Operator guidance"
                description="A clean companion panel for the team lead: monitor pressure, scan alerts, then push a targeted message only when needed."
              />
              <div className="grid gap-3">
                {hostZones.slice(0, 3).map((zone) => (
                  <div key={zone.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{zone.label}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {zone.status === "Critical"
                            ? "Dispatch marshals and update venue signage."
                            : zone.status === "Watch"
                              ? "Monitor queue pressure and keep reroute copy ready."
                              : "No intervention required right now."}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-semibold text-white">{zone.value}%</p>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-app-muted">Load</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>

        <BroadcastComposer
          message={broadcastMessage}
          severity={broadcastSeverity}
          target={broadcastTarget}
          onMessageChange={setBroadcastMessage}
          onSeverityChange={setBroadcastSeverity}
          onTargetChange={setBroadcastTarget}
          onSend={handleBroadcast}
          sending={sending}
        />
      </div>
    </DashboardShell>
  );
}
