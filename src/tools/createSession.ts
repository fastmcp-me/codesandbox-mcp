import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "node:crypto";

const InputSchema = z.object({
  sandboxId: z
    .string()
    .describe("Target sandbox ID where the session will be created."),
  sessionId: z
    .string()
    .optional()
    .describe(
      "Optional session identifier. If omitted, a UUID will be generated."
    ),
  permission: z
    .enum(["read", "write"])
    .optional()
    .describe(
      "Session permission. Use 'read' for non-mutating access, 'write' to allow edits."
    ),
  env: z
    .record(z.string())
    .optional()
    .describe(
      "Environment variables to inject into the session (key-value map)."
    ),
  git: z
    .object({
      provider: z.string().describe("Git provider, e.g. 'github'."),
      username: z.string().optional().describe("Git username."),
      accessToken: z.string().optional().describe("Access token for provider."),
      email: z.string().describe("Git email for commits."),
      name: z.string().optional().describe("Git display name for commits."),
    })
    .optional()
    .describe("Optional Git identity/settings for the session."),
});

export const registerCreateSession = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "createSession",
    {
      description:
        "Create a CodeSandbox session for a sandbox. Returns the sessionId without storing state on the server.",
      inputSchema: InputSchema.shape,
    },
    async (input) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(input.sandboxId);
      const id = input.sessionId ?? randomUUID().substring(0, 19);
      const session = await sandbox.createSession({
        id,
        permission: input.permission ?? (cfg.readOnly ? "read" : "write"),
        env: (input.env as Record<string, string> | undefined) ?? undefined,
        git: input.git as any,
      });
      const sessionId = session.sessionId ?? id;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ sessionId, sandboxId: input.sandboxId }),
          },
        ],
      };
    }
  );
};
