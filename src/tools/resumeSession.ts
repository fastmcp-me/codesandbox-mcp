import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sandboxId: z.string().describe("Target sandbox ID that holds the session."),
  sessionId: z.string().describe("Identifier of the existing session to connect to."),
  permission: z
    .enum(["read", "write"]) 
    .optional()
    .describe(
      "Optional permission if the session should be created when missing."
    ),
  env: z
    .record(z.string())
    .optional()
    .describe(
      "Optional environment variables used if the session is created."
    ),
});

export const registerResumeSession = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "resumeSession",
    {
      description:
        "Connect to an existing session by sandboxId + sessionId. If the session does not exist, it will be created with optional permission/env.",
      inputSchema: InputSchema.shape,
    },
    async (input) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(input.sandboxId);
      const client = await sandbox.connect({
        id: input.sessionId,
        permission: input.permission ?? (cfg.readOnly ? "read" : "write"),
        env: (input.env as Record<string, string> | undefined) ?? undefined,
      });
      // We do not keep state; dispose immediately to avoid leaking connections
      try {
        client.keepActiveWhileConnected(false);
      } catch {}
      try {
        client.dispose();
      } catch {}
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              sessionId: input.sessionId,
              sandboxId: input.sandboxId,
            }),
          },
        ],
      };
    }
  );
};
