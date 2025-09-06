import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { createSessionRegistry } from "../state/sessions.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "node:crypto";

// Singleton registry for the running process
const registry = createSessionRegistry();

const InputSchema = z.object({
  sandboxId: z.string(),
  permission: z.enum(["read", "write"]).optional(),
  env: z.record(z.string()).optional(),
});

export const registerCreateSession = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "createSession",
    {
      description: "Create and connect a session to a sandbox, returning sessionId.",
      inputSchema: InputSchema.shape,
    },
    async (input) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(input.sandboxId);
      const id = randomUUID();
      const session = await sandbox.createSession({
        id,
        permission: input.permission ?? (cfg.readOnly ? "read" : "write"),
        env: input.env as Record<string, string> | undefined,
      });
      const sessionId = session.sessionId ?? id;
      const client = await sandbox.connect({ id: sessionId });
      if (cfg.keepAlive) {
        client.keepActiveWhileConnected(true);
      }
      registry.set(sessionId, client);
      return {
        content: [{ type: "text", text: JSON.stringify({ sessionId, sandboxId: input.sandboxId }) }],
      };
    }
  );
};

export const getSessionRegistry = () => registry;
