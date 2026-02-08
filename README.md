# mcp-visual-chart

A Model Context Protocol (MCP) server that enables AI agents to create chart visualizations using Chart.js. Charts are rendered server-side as PNG images and returned inline to the agent, while also being saved to disk and optionally opened in the system viewer.

## Features

- **10 chart types**: bar, line, pie, doughnut, scatter, area, radar, bubble, polar area, histogram
- **Server-side rendering** via `chartjs-node-canvas` (no browser needed)
- **Smart defaults**: professional color palette, sizing, and styling out of the box
- **Dual output**: returns base64 PNG to the agent + saves to disk
- **Auto-open**: optionally opens the chart in the system's default image viewer
- **Customizable**: titles, subtitles, axis labels, colors, dimensions, stacked mode, horizontal bars

## Installation

```bash
npm install -g mcp-visual-chart
```

Or run directly:

```bash
npx mcp-visual-chart
```

## Setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "visual-chart": {
      "command": "npx",
      "args": ["-y", "mcp-visual-chart"]
    }
  }
}
```

### VS Code (GitHub Copilot / MCP extensions)

Create `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "visual-chart": {
      "command": "npx",
      "args": ["-y", "mcp-visual-chart"]
    }
  }
}
```

### For local development

```json
{
  "servers": {
    "visual-chart": {
      "command": "node",
      "args": ["/path/to/mcp-visual-chart/dist/index.js"]
    }
  }
}
```

## Tool: `create_chart`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | yes | `bar`, `line`, `pie`, `doughnut`, `scatter`, `area`, `radar`, `bubble`, `polarArea`, `histogram` |
| `labels` | string[] | no | Labels for data points |
| `datasets` | object[] | yes | Array of `{ label, data, backgroundColor, borderColor, borderWidth, fill }` |
| `options` | object | no | `{ title, subtitle, showLegend, width, height, backgroundColor, xAxisLabel, yAxisLabel, stacked, indexAxis }` |
| `outputPath` | string | no | Custom file path for the saved PNG |
| `autoOpen` | boolean | no | Open in default viewer (default: true) |

### Example prompts

- "Create a bar chart showing Q1 revenue: Jan $50k, Feb $65k, Mar $70k"
- "Make a pie chart of market share: Apple 30%, Samsung 25%, Others 45%"
- "Generate a line chart tracking website visitors over the last 7 days"
- "Create a stacked bar chart comparing actual vs budget for 3 months"
- "Make a horizontal bar chart of the top 5 programming languages"

## Development

```bash
git clone <repo-url>
cd mcp-visual-chart
npm install
npm run build       # build to dist/
npm run dev         # watch mode
```

### System requirements

- Node.js 18+
- On Linux, `canvas` native dependencies are needed:
  ```bash
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
  ```

## License

MIT
