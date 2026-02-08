# mcp-visual-chart

A Model Context Protocol (MCP) server that enables AI agents to create chart visualizations using Chart.js. Charts are rendered server-side as PNG or SVG and returned inline to the agent, while also being saved to disk and optionally opened in the system viewer.

## Features

- **10 chart types**: bar, line, pie, doughnut, scatter, area, radar, bubble, polar area, histogram
- **PNG & SVG output**: render charts as PNG (default) or SVG via `outputFormat`
- **Server-side rendering** via `chartjs-node-canvas` (no browser needed)
- **Smart defaults**: professional color palette, sizing, and styling out of the box
- **Data labels**: optionally display values directly on chart elements
- **Smooth curves**: configurable line tension for line/area charts
- **Logarithmic scale**: support for logarithmic y-axis
- **Input validation**: descriptive error messages for data shape mismatches and invalid configurations
- **Dual output**: returns base64 image to the agent + saves to disk
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
| `options` | object | no | See options below |
| `outputFormat` | string | no | `png` (default) or `svg` |
| `outputPath` | string | no | Custom file path for the saved chart |
| `autoOpen` | boolean | no | Open in default viewer (default: true) |

### Options

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | Chart title |
| `subtitle` | string | Chart subtitle |
| `showLegend` | boolean | Show legend (default: true) |
| `width` | number | Image width in pixels (default: 800) |
| `height` | number | Image height in pixels (default: 600) |
| `backgroundColor` | string | Background color (default: white) |
| `xAxisLabel` | string | X-axis label |
| `yAxisLabel` | string | Y-axis label |
| `stacked` | boolean | Stack datasets |
| `indexAxis` | `"x"` \| `"y"` | Set to `"y"` for horizontal bar chart |
| `yAxisType` | `"linear"` \| `"logarithmic"` | Y-axis scale type (default: linear) |
| `beginAtZero` | boolean | Force y-axis to start at zero |
| `tension` | number | Line smoothing: 0 = straight (default), 0.4 = smooth. For line/area charts |
| `showDataLabels` | boolean | Show data values on chart elements (default: false) |

### Example prompts

- "Create a bar chart showing Q1 revenue: Jan $50k, Feb $65k, Mar $70k"
- "Make a pie chart of market share: Apple 30%, Samsung 25%, Others 45%"
- "Generate a smooth line chart tracking website visitors over the last 7 days"
- "Create a stacked bar chart comparing actual vs budget for 3 months"
- "Make a horizontal bar chart of the top 5 programming languages"
- "Create a bar chart with data labels showing exact values"
- "Generate an SVG line chart with logarithmic y-axis for exponential growth data"

## Development

```bash
git clone <repo-url>
cd mcp-visual-chart
npm install
npm run build       # build to dist/
npm run dev         # watch mode
npm test            # run tests
npm run test:watch  # tests in watch mode
```

### System requirements

- Node.js 18+
- On Linux, `canvas` native dependencies are needed:
  ```bash
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
  ```

## License

MIT
