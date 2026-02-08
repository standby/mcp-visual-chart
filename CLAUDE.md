# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that renders Chart.js charts server-side as PNG or SVG images. AI agents call the `create_chart` tool via JSON-RPC over stdio, and receive a base64-encoded image in the response.

## Build & Run

```bash
npm run build       # tsup bundles src/index.ts → dist/index.js (ESM, with shebang)
npm run dev         # tsup --watch
npm test            # vitest run (unit + integration tests)
npm run test:watch  # vitest in watch mode
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
├── renderer.ts       # chartjs-node-canvas rendering (PNG & SVG), Chart.js config builder
├── validation.ts     # Semantic input validation with descriptive error messages
├── colors.ts         # Default color palettes + applyColorPalette()
├── file-utils.ts     # saveChart() to disk, openChart() via platform command
└── __tests__/        # Unit tests (colors, validation, renderer, file-utils) + integration test
```

**Data flow**: MCP JSON-RPC request → `server.ts` tool handler → `validation.ts` validates input → `renderer.ts` builds Chart.js config & renders to PNG/SVG buffer → `file-utils.ts` saves/opens → response with `{type: "image", data: base64, mimeType: "image/png"|"image/svg+xml"}`.

## Key Patterns

- **All logging must use `console.error()`** — stdout is reserved for JSON-RPC messages. Using `console.log()` will corrupt the protocol.
- **McpServer high-level API**: tools are registered with `server.tool(name, description, zodSchema, handler)`. The Zod schema is auto-converted to JSON Schema for the tool's `inputSchema`.
- **Chart type mapping**: `area` → Chart.js `line` with `fill: true`; `histogram` → Chart.js `bar` with linear x-axis.
- **Color auto-assignment**: `applyColorPalette()` in `colors.ts` assigns colors to datasets that don't specify their own. Pie/doughnut/polarArea get per-segment colors; other types get one color per dataset.
- **SVG output**: set `outputFormat: "svg"` to get SVG instead of PNG. Uses `chartjs-node-canvas` with `type: 'svg'` canvas.
- **Input validation**: `validateChartInput()` in `validation.ts` checks semantic correctness (label/data count mismatch, bubble/scatter data shape, dimension bounds) before rendering.
- **Version sync**: `server.ts` reads version from `package.json` at runtime via `createRequire` to avoid hardcoded version drift.
- **Build output**: tsup produces a single ESM bundle at `dist/index.js` with `#!/usr/bin/env node` shebang.

## Testing

Tests use vitest. Run with `npm test`. Tests cover:
- `colors.test.ts` — color palette assignment for segmented and non-segmented chart types
- `validation.test.ts` — input validation error messages and edge cases
- `renderer.test.ts` — PNG and SVG rendering for all chart types
- `file-utils.test.ts` — file path generation and directory creation
- `integration.test.ts` — full MCP request/response flow via in-memory transport

## Dependencies

- `@modelcontextprotocol/sdk` — official MCP TypeScript SDK (v1.x, `McpServer` + `StdioServerTransport`)
- `chart.js` v4 — charting library
- `chartjs-node-canvas` v5 — server-side Canvas rendering for Chart.js
- `zod` — schema validation (used by MCP SDK for tool input schemas)
