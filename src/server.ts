import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createRequire } from 'module';
import { renderChart, ChartInput } from './renderer.js';
import { validateChartInput } from './validation.js';
import { saveChart, openChart, getDefaultOutputPath } from './file-utils.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-visual-chart',
    version,
  });

  const chartTypeEnum = z.enum([
    'bar',
    'line',
    'pie',
    'doughnut',
    'scatter',
    'area',
    'radar',
    'bubble',
    'polarArea',
    'histogram',
  ]);

  server.tool(
    'create_chart',
    'Create a chart visualization. Renders a Chart.js chart as PNG or SVG, saves to disk, and returns the image. Supports: bar, line, pie, doughnut, scatter, area, radar, bubble, polarArea, histogram.',
    {
      type: chartTypeEnum.describe('Chart type'),
      labels: z
        .array(z.string())
        .optional()
        .describe('Labels for data points (x-axis for bar/line, segments for pie)'),
      datasets: z
        .array(
          z.object({
            label: z.string().optional().describe('Dataset name shown in legend'),
            data: z.array(
              z.union([
                z.number(),
                z.object({
                  x: z.number(),
                  y: z.number(),
                  r: z.number().optional().describe('Bubble radius'),
                }),
              ]),
            ).describe('Data values'),
            backgroundColor: z
              .union([z.string(), z.array(z.string())])
              .optional()
              .describe('Fill color(s)'),
            borderColor: z
              .union([z.string(), z.array(z.string())])
              .optional()
              .describe('Border color(s)'),
            borderWidth: z.number().optional(),
            fill: z.boolean().optional().describe('Fill area under line'),
          }).passthrough(),
        )
        .describe('One or more data series'),
      options: z
        .object({
          title: z.string().optional().describe('Chart title'),
          subtitle: z.string().optional().describe('Chart subtitle'),
          showLegend: z.boolean().optional().describe('Show legend (default true)'),
          width: z.number().optional().describe('Image width in pixels (default 800)'),
          height: z.number().optional().describe('Image height in pixels (default 600)'),
          backgroundColor: z
            .string()
            .optional()
            .describe('Background color (default white)'),
          xAxisLabel: z.string().optional().describe('X-axis label'),
          yAxisLabel: z.string().optional().describe('Y-axis label'),
          stacked: z.boolean().optional().describe('Stack datasets'),
          indexAxis: z
            .enum(['x', 'y'])
            .optional()
            .describe('Set to "y" for horizontal bar chart'),
          yAxisType: z
            .enum(['linear', 'logarithmic'])
            .optional()
            .describe('Y-axis scale type (default linear)'),
          beginAtZero: z
            .boolean()
            .optional()
            .describe('Force y-axis to start at zero (default false)'),
          tension: z
            .number()
            .optional()
            .describe('Line smoothing: 0 = straight (default), 0.4 = smooth curves. For line/area charts.'),
          showDataLabels: z
            .boolean()
            .optional()
            .describe('Show data values directly on chart elements (default false)'),
        })
        .passthrough()
        .optional()
        .describe('Chart display options'),
      outputFormat: z
        .enum(['png', 'svg'])
        .optional()
        .describe('Output format: png (default) or svg'),
      outputPath: z
        .string()
        .optional()
        .describe('Custom file path to save the chart'),
      autoOpen: z
        .boolean()
        .optional()
        .describe('Open chart in default viewer (default true)'),
    },
    async (args) => {
      try {
        const input: ChartInput = {
          type: args.type,
          labels: args.labels,
          datasets: args.datasets,
          options: args.options,
          outputFormat: args.outputFormat as ChartInput['outputFormat'],
          outputPath: args.outputPath,
          autoOpen: args.autoOpen,
        };

        validateChartInput(input);

        const result = await renderChart(input);

        const outputPath =
          input.outputPath ||
          getDefaultOutputPath(input.type, result.extension);
        await saveChart(result.buffer, outputPath);

        if (input.autoOpen !== false) {
          openChart(outputPath);
        }

        return {
          content: [
            {
              type: 'image' as const,
              data: result.base64,
              mimeType: result.mimeType,
            },
            {
              type: 'text' as const,
              text: `Chart saved to: ${outputPath}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error creating chart: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
