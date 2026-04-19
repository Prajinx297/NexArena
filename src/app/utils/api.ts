import axios from 'axios';
import { auth } from '../../lib/firebase';
import type { Event, Ticket, Alert, Recommendation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_URL is not set - API calls will fail");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Token fetch failed:", error);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.detail || err.message || "Request failed";
    console.error("API Error:", msg, err.config?.url);
    return Promise.reject(new Error(msg));
  }
);

export async function getEvents(): Promise<Event[]> {
  const data = await api.get('/events');
  return data.events ?? [];
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const events = await getEvents();
  return events.find((event) => event.id === eventId) ?? null;
}

export async function getUserTickets(uid: string): Promise<Ticket[]> {
  const data = await api.get(`/user-tickets/${uid}`);
  return data.tickets ?? [];
}

export async function verifyTicket(ticketId: string): Promise<{ valid: boolean; ticket: Ticket }> {
  const data = await api.get(`/verify-ticket/${ticketId}`);
  return data;
}

export async function verifyHost(hostId: string, eventId: string): Promise<{ valid: boolean }> {
  const data = await api.post('/verify-host', { host_id: hostId, event_id: eventId });
  return data;
}

export async function getAlerts(): Promise<Alert[]> {
  const data = await api.get('/alerts');
  return data.alerts ?? [];
}

export async function getAlertsForEvent(eventId: string): Promise<Alert[]> {
  const data = await api.get('/alerts', { params: { event_id: eventId } });
  return data.alerts ?? [];
}

export async function createAlert(alertData: { title: string; description: string; severity: string; event_id?: string; zone?: string }): Promise<void> {
  await api.post('/generate-alert', alertData);
}

export async function deleteAlert(alertId: string): Promise<void> {
  await api.delete(`/alerts/${alertId}`);
}

export async function getCrowd(eventId: string) {
  const data = await api.get(`/crowd/${eventId}`);
  return data;
}

export async function getWaitTime(eventId: string) {
  const data = await api.get(`/wait-time/${eventId}`);
  return data;
}

export async function getRecommendations(eventId: string): Promise<Recommendation> {
  const data = await api.get(`/recommend/${eventId}`);
  return data.recommendation;
}

export async function triggerAutoAlerts(eventId: string) {
  const data = await api.post(`/auto-alerts/${eventId}`);
  return data;
}

export async function savePreferences(preferences: { notifications: boolean; sound: boolean }) {
  const data = await api.put("/preferences", preferences);
  return data.preferences;
}

export async function sendChatMessage(payload: { event_id: string; message: string }) {
  const data = await api.post("/chat", payload);
  return data.answer as string;
}

export async function resolveAlert(alertId: string, eventId: string) {
  await api.delete(`/alerts/${alertId}`, { params: { event_id: eventId } });
}

export { api, API_BASE_URL };
