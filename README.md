# CodeSandbox MCP Server

A Model Context Protocol (MCP) server that exposes CodeSandbox SDK operations as tools for AI agents.

- Runtime: Node.js 18+
- Auth: `CODESANDBOX_API_TOKEN` (or `CSB_API_KEY`)
- SDK: Official `@codesandbox/sdk`

## Install / Run

Use via `npx` in your MCP client config, similar to Supabase examples.

Example (cursor or Claude Desktop config snippet):

```
{
  "mcpServers": {
    "codesandbox": {
      "command": "npx",
      "args": [
        "-y",
        "@mcp-server/codesandbox@latest",
        "--read-only"
      ],
      "env": {
        "CODESANDBOX_API_TOKEN": "<your-api-token>"
      }
    }
  }
}
```

Flags:
- `--read-only`: disallow mutating tools (write/rename) and default sessions to read permission
- `--vm-tier <tier>`: default VM tier when creating/resuming
- `--hibernation-timeout <seconds>`: default inactivity hibernation timeout
- `--keep-alive`: keep sessions active while connected
- `--log-level <error|warn|info|debug>`

## Tools

- `createSandbox`: Create a sandbox (optionally from template `id`) with optional VM settings.
- `resumeSandbox`: Resume or start a sandbox by `sandboxId`.
- `hibernateSandbox`: Hibernate a sandbox by `sandboxId`.
- `createSession`: Create/connect a session for a `sandboxId` (FS ops require an active session).
- `resumeSession`: Reconnect to an existing session by `sandboxId` + `sessionId`.
- `readFile`: Read a file using `{ sessionId, path, encoding? }` (returns text).
- `writeFile`: Write a file using `{ sessionId, path, content, encoding?, overwrite? }`.
- `rename`: Rename/move using `{ sessionId, from, to, overwrite? }`.

Notes:
- Filesystem operations run inside an active session (`SandboxClient.fs`).
- Outputs are returned as text blocks (JSON payloads serialized to string) for broad client compatibility.

## Development

- Build: `npm run build`
- Dev (stdio): `npm run dev` (requires token env var)

## Environment

- `CODESANDBOX_API_TOKEN` (preferred) or `CSB_API_KEY`: PAT with scopes for Sandbox Creation, Read/Edit, VM Manage, Preview Token Manage.

## Limitations

- This server targets CodeSandbox sandboxes (VMs), not legacy projects.
- Session resume uses `sandbox.connect({ id: sessionId })`.

