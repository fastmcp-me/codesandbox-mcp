import { z } from "zod";

// Functional config parsing with Zod, supports two env var names for token
const EnvSchema = z.object({
  CODESANDBOX_API_TOKEN: z.string().optional(),
  CSB_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).optional(),
});

export type AppConfig = {
  token: string;
  readOnly: boolean;
  vmTier?: string;
  hibernationTimeoutSeconds?: number;
  keepAlive: boolean;
  logLevel: "error" | "warn" | "info" | "debug";
};

export type CliArgs = {
  readOnly?: boolean;
  vmTier?: string;
  hibernationTimeoutSeconds?: number;
  keepAlive?: boolean;
  logLevel?: "error" | "warn" | "info" | "debug";
};

export const loadConfig = (args: CliArgs): AppConfig => {
  const env = EnvSchema.parse(process.env);

  const token = env.CODESANDBOX_API_TOKEN || env.CSB_API_KEY;
  if (!token) {
    throw new Error(
      "Missing CodeSandbox token. Set CODESANDBOX_API_TOKEN or CSB_API_KEY."
    );
  }

  return {
    token,
    readOnly: Boolean(args.readOnly),
    vmTier: args.vmTier,
    hibernationTimeoutSeconds: args.hibernationTimeoutSeconds,
    keepAlive: Boolean(args.keepAlive),
    logLevel: args.logLevel ?? (env.LOG_LEVEL ?? "info"),
  };
};

