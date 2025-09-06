import type { AppConfig } from "../config.js";
import { z } from "zod";
import { getSessionRegistry } from "./createSession.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sessionId: z.string(),
  path: z.string(),
  content: z.string(),
  encoding: z.enum(["utf8", "base64"]).optional(),
  overwrite: z.boolean().optional(),
});

export const registerWriteFile = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "writeFile",
    {
      description: "Write a file in the sandbox filesystem within an active session.",
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
      const buf =
        input.encoding === "base64"
          ? Buffer.from(input.content, "base64")
          : Buffer.from(input.content, "utf8");
      await client.fs.writeFile(input.path, buf, {
        overwrite: input.overwrite ?? true,
        create: true,
      });
      return { content: [{ type: "text", text: "ok" }] };
    }
  );
};
