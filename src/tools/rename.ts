import type { AppConfig } from "../config.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSdk } from "../sdk/client.js";

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
    .describe("Optional permission if session needs to be created. Must allow writes."),
  env: z
    .record(z.string())
    .optional()
    .describe(
      "Optional environment variables if the session is created."
    ),
  from: z.string().describe("Existing path to rename/move from."),
  to: z.string().describe("Target path to rename/move to."),
  overwrite: z
    .boolean()
    .optional()
    .describe("Whether to overwrite if the target exists. Defaults to true."),
});

export const registerRename = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "rename",
    {
      description:
        "Rename (move) a file or directory within the sandbox filesystem. Stateless: connects per call using sandboxId+sessionId.",
      inputSchema: InputSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      if (cfg.readOnly) {
        return { isError: true, content: [{ type: "text", text: "Server is in read-only mode" }] } as const;
      }
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(input.sandboxId);
      const client = await sandbox.connect({
        id: input.sessionId,
        permission: input.permission ?? "write",
        env: (input.env as Record<string, string> | undefined) ?? undefined,
      });
      await client.fs.rename(input.from, input.to, input.overwrite ?? true);
      try {
        client.dispose();
      } catch {}
      return { content: [{ type: "text", text: "ok" }] };
    }
  );
};
