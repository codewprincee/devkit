export const APP_NAME = "DevKit";
export const APP_VERSION = "0.1.0";

export const REFRESH_INTERVALS = {
  PORTS: 5000,
  SERVICES: 10000,
  LOGS: 1000,
  ENV: 30000,
} as const;

export const TOAST_DURATION = 3500;

export const LOG_LEVEL_COLORS: Record<string, string> = {
  error: "#dc2626",
  warn: "#d97706",
  info: "#2563eb",
  debug: "#6b7280",
  trace: "#9ca3af",
  unknown: "#9e9eb0",
};
