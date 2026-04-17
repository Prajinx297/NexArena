export interface Event {
  id: string;
  name: string;
  stadium: string;
  city: string;
  date: string;
  capacity: string;
  image: string;
  status: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  seat: string;
  gate: string;
  status: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp: string;
  zone?: string;
}

export interface Host {
  id: string;
  event_id: string;
  name: string;
}

export interface CrowdData {
  zone: string;
  density: number;
  timestamp?: string;
}

export interface WaitTimeData {
  entrance: string;
  minutes: number;
}

export interface Recommendation {
  type: string;
  title: string;
  reason: string;
  confidence_percent: number;
}

export type ThemeMode = 'dark' | 'light';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';
