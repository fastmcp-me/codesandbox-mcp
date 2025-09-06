import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { AppConfig } from "./config.js";
import { registerCreateSandbox } from "./tools/createSandbox.js";
import { registerResumeSandbox } from "./tools/resumeSandbox.js";
import { registerHibernateSandbox } from "./tools/hibernateSandbox.js";
import { registerCreateSession } from "./tools/createSession.js";
import { registerResumeSession } from "./tools/resumeSession.js";
import { registerReadFile } from "./tools/readFile.js";
import { registerWriteFile } from "./tools/writeFile.js";
import { registerRename } from "./tools/rename.js";

export const startServer = async (cfg: AppConfig) => {
  const mcp = new McpServer(
    { name: "codesandbox-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  // Register tools
  registerCreateSandbox(mcp, cfg);
  registerResumeSandbox(mcp, cfg);
  registerHibernateSandbox(mcp, cfg);
  registerCreateSession(mcp, cfg);
  registerResumeSession(mcp, cfg);
  registerReadFile(mcp, cfg);
  registerWriteFile(mcp, cfg);
  registerRename(mcp, cfg);

  const transport = new StdioServerTransport();
  await mcp.connect(transport);
};
