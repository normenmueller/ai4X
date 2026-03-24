#!/usr/bin/env node

import { logLine } from "../lib/shared/log.ts";
import { run } from "../lib/app/main.ts";

run(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const exitCode =
      typeof error === "object" &&
      error !== null &&
      "exitCode" in error &&
      typeof (error as { exitCode: unknown }).exitCode === "number"
        ? ((error as { exitCode: number }).exitCode)
        : 1;
    process.stderr.write(`${logLine("ERROR", message)}\n`);
    process.exitCode = exitCode;
  });
