export type LogLevel = "info" | "warn" | "error";

export const VERSION = "0.1.0";
export const COPYRIGHT_YEAR = "2026";
export const APP_NAME = "ai4X";
export const AUTHOR = "nemron";

export function logLine(level: LogLevel, message: string): string {
  return `[${APP_NAME}|${level}] ${message}`;
}
