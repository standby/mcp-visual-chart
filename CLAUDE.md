# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that renders Chart.js charts server-side as PNG images. AI agents call the `create_chart` tool via JSON-RPC over stdio, and receive a base64-encoded PNG in the response.

## Build & Run

```bash
npm run build       # tsup bundles src/index.ts → dist/index.js (ESM, with shebang)
npm run dev         # tsup --watch
```

To test the server manually:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node dist/index.js 2>/dev/null
```

## Architecture

```
src/
├── index.ts          # Entry point: creates server, connects StdioServerTransport
├── server.ts         # McpServer instance + create_chart tool registration (Zod schema)
├── renderer.ts       # chartjs-node-canvas rendering, Chart.js config builder
├── colors.ts         # Default color palettes + applyColorPalette()
└── file-utils.ts     # saveChart() to disk, openChart() via platform command
```

**Data flow**: MCP JSON-RPC request → `server.ts` tool handler → `renderer.ts` builds Chart.js config & renders to PNG buffer → `file-utils.ts` saves/opens → response with `{type: "image", data: base64, mimeType: "image/png"}`.

## Key Patterns

- **All logging must use `console.error()`** — stdout is reserved for JSON-RPC messages. Using `console.log()` will corrupt the protocol.
- **McpServer high-level API**: tools are registered with `server.tool(name, description, zodSchema, handler)`. The Zod schema is auto-converted to JSON Schema for the tool's `inputSchema`.
- **Chart type mapping**: `area` → Chart.js `line` with `fill: true`; `histogram` → Chart.js `bar` with linear x-axis.
- **Color auto-assignment**: `applyColorPalette()` in `colors.ts` assigns colors to datasets that don't specify their own. Pie/doughnut/polarArea get per-segment colors; other types get one color per dataset.
- **Build output**: tsup produces a single ESM bundle at `dist/index.js` with `#!/usr/bin/env node` shebang.

## Dependencies

- `@modelcontextprotocol/sdk` — official MCP TypeScript SDK (v1.x, `McpServer` + `StdioServerTransport`)
- `chart.js` v4 — charting library
- `chartjs-node-canvas` v5 — server-side Canvas rendering for Chart.js
- `zod` — schema validation (used by MCP SDK for tool input schemas)
