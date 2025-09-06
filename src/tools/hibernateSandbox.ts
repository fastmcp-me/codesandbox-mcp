import type { AppConfig } from "../config.js";
import { createSdk } from "../sdk/client.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const InputSchema = z.object({ sandboxId: z.string() });

export const registerHibernateSandbox = (server: McpServer, cfg: AppConfig) => {
  server.registerTool(
    "hibernateSandbox",
    { description: "Hibernate a sandbox (saves files and puts VM to sleep).", inputSchema: InputSchema.shape },
    async ({ sandboxId }) => {
      const sdk = createSdk(cfg);
      await sdk.sandboxes.hibernate(sandboxId);
      return { content: [{ type: "text", text: "ok" }] };
    }
  );
};
