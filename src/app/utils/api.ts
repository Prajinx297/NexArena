import axios from 'axios';
import { auth } from '../../lib/firebase';
import type { Event, Ticket, Alert, Recommendation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) { /* silently fail */ }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function getEvents(): Promise<Event[]> {
  const { data } = await api.get('/events');
  return data.events;
}

export async function getUserTickets(uid: string): Promise<Ticket[]> {
  const { data } = await api.get(`/user-tickets/${uid}`);
  return data.tickets;
}

export async function verifyTicket(ticketId: string): Promise<{ valid: boolean; ticket: Ticket }> {
  const { data } = await api.get(`/verify-ticket/${ticketId}`);
  return data;
}

export async function verifyHost(hostId: string, eventId: string): Promise<{ valid: boolean }> {
  const { data } = await api.post('/verify-host', { host_id: hostId, event_id: eventId });
  return data;
}

export async function getAlerts(): Promise<Alert[]> {
  const { data } = await api.get('/alerts');
  return data.alerts;
}

export async function createAlert(alertData: { title: string; description: string; severity: string }): Promise<void> {
  await api.post('/generate-alert', alertData);
}

export async function deleteAlert(alertId: string): Promise<void> {
  await api.delete(`/alerts/${alertId}`);
}

export async function getCrowd(eventId: string) {
  const { data } = await api.get(`/crowd/${eventId}`);
  return data;
}

export async function getWaitTime(eventId: string) {
  const { data } = await api.get(`/wait-time/${eventId}`);
  return data;
}

export async function getRecommendations(eventId: string): Promise<Recommendation> {
  const { data } = await api.get(`/recommend/${eventId}`);
  return data.recommendation;
}

export async function triggerAutoAlerts(eventId: string) {
  const { data } = await api.post(`/auto-alerts/${eventId}`);
  return data;
}

export { api, API_BASE_URL };
