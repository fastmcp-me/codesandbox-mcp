import type { AppConfig } from "../config.js";
import { z } from "zod";
import { getSessionRegistry } from "./createSession.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sessionId: z.string(),
  from: z.string(),
  to: z.string(),
  overwrite: z.boolean().optional(),
});

export const registerRename = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "rename",
    {
      description: "Rename (move) a file or directory within the sandbox filesystem.",
      inputSchema: InputSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      if (cfg.readOnly) {
        return { isError: true, content: [{ type: "text", text: "Server is in read-only mode" }] } as const;
      }
      const registry = getSessionRegistry();
      const client = registry.get(input.sessionId);
      if (!client) {
        return { isError: true, content: [{ type: "text", text: `Session not found: ${input.sessionId}` }] } as const;
      }
      await client.fs.rename(input.from, input.to, input.overwrite ?? true);
      return { content: [{ type: "text", text: "ok" }] };
    }
  );
};
