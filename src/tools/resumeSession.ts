import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { getSessionRegistry } from "./createSession.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sandboxId: z.string(),
  sessionId: z.string(),
});

export const registerResumeSession = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "resumeSession",
    {
      description: "Resume an existing session by reconnecting the SandboxClient.",
      inputSchema: InputSchema.shape,
    },
    async (input) => {
      const registry = getSessionRegistry();
      const existing = registry.get(input.sessionId);
      if (existing) {
        return {
          content: [{ type: "text", text: JSON.stringify({ sessionId: input.sessionId, sandboxId: input.sandboxId }) }],
        };
      }
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(input.sandboxId);
      const client = await sandbox.connect({ id: input.sessionId });
      registry.set(input.sessionId, client);
      return {
        content: [{ type: "text", text: JSON.stringify({ sessionId: input.sessionId, sandboxId: input.sandboxId }) }],
      };
    }
  );
};
