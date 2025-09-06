import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VMTier } from "@codesandbox/sdk";

const InputSchema = z.object({
  sandboxId: z
    .string()
    .describe("Target sandbox ID to update (VM must be running)."),
  vmTier: z
    .enum(["Pico", "Nano", "Micro", "Small", "Medium", "Large", "XLarge"]) 
    .optional()
    .describe("Change VM tier dynamically without reboot."),
  hibernationTimeoutSeconds: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Update inactivity hibernation timeout in seconds (max 86400)."
    ),
});

export const registerUpdateSandbox = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "updateSandbox",
    {
      description:
        "Update VM settings for a running sandbox: tier and/or hibernation timeout.",
      inputSchema: InputSchema.shape,
    },
    async (input) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(input.sandboxId);
      if (!input.vmTier && !input.hibernationTimeoutSeconds) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "No update specified: provide 'vmTier' and/or 'hibernationTimeoutSeconds'",
            },
          ],
        } as const;
      }
      if (input.vmTier) {
        await sandbox.updateTier((VMTier as any).fromName(input.vmTier));
      }
      if (typeof input.hibernationTimeoutSeconds === "number") {
        await sandbox.updateHibernationTimeout(input.hibernationTimeoutSeconds);
      }
      return { content: [{ type: "text", text: "ok" }] };
    }
  );
};

