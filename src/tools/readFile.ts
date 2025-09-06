import type { AppConfig } from "../config.js";
import { z } from "zod";
import { getSessionRegistry } from "./createSession.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sessionId: z.string(),
  path: z.string(),
  encoding: z.enum(["utf8", "base64"]).optional(),
});

export const registerReadFile = (server: McpServer, _cfg: AppConfig) => {
  server.registerTool(
    "readFile",
    {
      description: "Read a file from the sandbox filesystem within an active session.",
      inputSchema: InputSchema.shape,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      const registry = getSessionRegistry();
      const client = registry.get(input.sessionId);
      if (!client) {
        return {
          isError: true,
          content: [{ type: "text", text: `Session not found: ${input.sessionId}` }],
        } as const;
      }
      const data = await client.fs.readFile(input.path);
      const encoding = input.encoding ?? "utf8";
      const content =
        encoding === "base64"
          ? Buffer.from(data).toString("base64")
          : Buffer.from(data).toString("utf8");
      return { content: [{ type: "text", text: content }] };
    }
  );
};
