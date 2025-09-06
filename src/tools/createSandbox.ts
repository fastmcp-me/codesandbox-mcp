import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({
  privacy: z.enum(["public", "private"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  path: z.string().optional(),
  id: z.string().optional(), // template id (sandboxId)
  ipcountry: z.string().length(2).optional(),
  vmTier: z.string().optional(),
  hibernationTimeoutSeconds: z.number().int().positive().optional(),
  automaticWakeupConfig: z
    .object({
      http: z.boolean().optional(),
      websocket: z.boolean().optional(),
    })
    .optional(),
});

export const registerCreateSandbox = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "createSandbox",
    {
      description:
        "Create a CodeSandbox sandbox (optionally from a template) and optionally start with custom VM settings.",
      inputSchema: InputSchema.shape,
    },
    async (input) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.create({
        id: input.id,
        title: input.title,
        description: input.description,
        tags: input.tags,
        path: input.path,
        privacy: input.privacy as any,
        ipcountry: input.ipcountry,
        vmTier: (input.vmTier ?? cfg.vmTier) as any,
        hibernationTimeoutSeconds:
          input.hibernationTimeoutSeconds ?? cfg.hibernationTimeoutSeconds,
        automaticWakeupConfig: input.automaticWakeupConfig as any,
      });
      const payload = {
        sandboxId: sandbox.id,
        bootupType: sandbox.bootupType,
        cluster: sandbox.cluster,
        isUpToDate: sandbox.isUpToDate,
      };
      return { content: [{ type: "text", text: JSON.stringify(payload) }] };
    }
  );
};
