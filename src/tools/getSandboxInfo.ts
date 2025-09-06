import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  sandboxId: z
    .string()
    .describe("Sandbox ID to fetch information for (no VM resume)."),
});

export const registerGetSandboxInfo = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "getSandboxInfo",
    {
      description:
        "Get metadata for a sandbox by ID without resuming the VM (title, description, privacy, tags).",
      inputSchema: InputSchema.shape,
    },
    async ({ sandboxId }) => {
      const sdk = createSdk(cfg);
      const info = await sdk.sandboxes.get(sandboxId);
      return { content: [{ type: "text", text: JSON.stringify(info) }] };
    }
  );
};

