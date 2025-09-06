import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sandboxId: z.string().describe("Target sandbox ID to operate on."),
  sessionId: z
    .string()
    .describe(
      "Session identifier to connect with. If missing in the sandbox, it will be created."
    ),
  permission: z
    .enum(["read", "write"])
    .optional()
    .describe(
      "Optional permission if session needs to be created. Defaults to 'read' when server is read-only."
    ),
  env: z
    .record(z.string())
    .optional()
    .describe("Optional environment variables if the session is created."),
  path: z
    .string()
    .describe("Absolute path to list within the sandbox filesystem."),
});

export const registerReaddir = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "readdir",
    {
      description:
        "List files and directories at a given path in the sandbox filesystem. Stateless: connects per call using sandboxId+sessionId.",
      inputSchema: InputSchema.shape,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.create({
        id: input.sandboxId,
      });
      const client = await sandbox.connect({
        id: input.sessionId,
        permission: input.permission ?? (cfg.readOnly ? "read" : "write"),
        env: (input.env as Record<string, string> | undefined) ?? undefined,
      });
      const entries = await client.fs.readdir(input.path);
      try {
        client.dispose();
      } catch {}
      return {
        content: [
          { type: "text", text: JSON.stringify({ path: input.path, entries }) },
        ],
      };
    }
  );
};
