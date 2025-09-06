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
    .describe(
      "Optional permission if session needs to be created. Must be 'write' to modify files if server is not read-only."
    ),
  env: z
    .record(z.string())
    .optional()
    .describe(
      "Optional environment variables if the session is created."
    ),
  path: z.string().describe("Absolute path to the file in the sandbox."),
  content: z.string().describe("Content to write (encoded as per 'encoding')."),
  encoding: z
    .enum(["utf8", "base64"]) 
    .optional()
    .describe("Encoding of 'content'. Defaults to 'utf8'."),
  overwrite: z
    .boolean()
    .optional()
    .describe("Whether to overwrite an existing file. Defaults to true."),
  create: z
    .boolean()
    .optional()
    .describe("Whether to create the file if it does not exist. Defaults to true."),
});

export const registerWriteFile = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "writeFile",
    {
      description:
        "Write a file in the sandbox filesystem. Stateless: connects per call using sandboxId+sessionId.",
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
      const buf =
        input.encoding === "base64"
          ? Buffer.from(input.content, "base64")
          : Buffer.from(input.content, "utf8");
      await client.fs.writeFile(input.path, buf, {
        overwrite: input.overwrite ?? true,
        create: input.create ?? true,
      });
      try {
        client.dispose();
      } catch {}
      return { content: [{ type: "text", text: "ok" }] };
    }
  );
};
