import { APP_NAME } from './constants.ts';

export type LogLevel = "info" | "warn" | "error";

export function logLine(level: LogLevel, message: string): string {
  return `[${APP_NAME}|${level}] ${message}`;
}
