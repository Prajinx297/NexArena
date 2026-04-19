import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <rect width="1200" height="675" fill="#0f172a"/>
      <rect x="48" y="48" width="1104" height="579" rx="32" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.25"/>
      <text x="50%" y="48%" text-anchor="middle" fill="#e2e8f0" font-size="44" font-family="Arial, sans-serif">NexArena</text>
      <text x="50%" y="56%" text-anchor="middle" fill="#94a3b8" font-size="24" font-family="Arial, sans-serif">Image unavailable</text>
    </svg>`,
  );
