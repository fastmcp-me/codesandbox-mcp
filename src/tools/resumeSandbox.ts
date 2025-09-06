import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({ sandboxId: z.string() });

export const registerResumeSandbox = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "resumeSandbox",
    { description: "Resume a hibernated sandbox or start it if shut down.", inputSchema: InputSchema.shape },
    async ({ sandboxId }) => {
      const sdk = createSdk(cfg);
      const sandbox = await sdk.sandboxes.resume(sandboxId);
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
