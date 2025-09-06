#!/usr/bin/env node
import { loadConfig, type CliArgs } from "./config.js";
import { startServer } from "./server.js";

// Minimal arg parsing without additional deps
const parseArgs = (argv: string[]): CliArgs => {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--read-only") out.readOnly = true;
    else if (a === "--keep-alive") out.keepAlive = true;
    else if (a === "--vm-tier") out.vmTier = argv[++i];
    else if (a === "--hibernation-timeout") out.hibernationTimeoutSeconds = Number(argv[++i]);
    else if (a === "--log-level") out.logLevel = (argv[++i] as any);
  }
  return out;
};

const main = async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    const cfg = loadConfig(args);
    await startServer(cfg);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[codesandbox-mcp] Fatal: ${msg}`);
    process.exit(1);
  }
};

main();

