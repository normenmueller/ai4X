export const APP_NAME = "ai4x";

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export function logLine(level: LogLevel, message: string): string {
  return `[${APP_NAME}|${level}]: ${message}`;
}
