import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { renderChart, ChartInput } from './renderer.js';
import { saveChart, openChart, getDefaultOutputPath } from './file-utils.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-visual-chart',
    version: '0.1.0',
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
    'Create a chart visualization. Renders a Chart.js chart as PNG, saves to disk, and returns the image. Supports: bar, line, pie, doughnut, scatter, area, radar, bubble, polarArea, histogram.',
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
        })
        .passthrough()
        .optional()
        .describe('Chart display options'),
      outputPath: z
        .string()
        .optional()
        .describe('Custom file path to save the chart PNG'),
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
          outputPath: args.outputPath,
          autoOpen: args.autoOpen,
        };

        const { buffer, base64 } = await renderChart(input);

        const outputPath = input.outputPath || getDefaultOutputPath(input.type);
        await saveChart(buffer, outputPath);

        if (input.autoOpen !== false) {
          openChart(outputPath);
        }

        return {
          content: [
            {
              type: 'image' as const,
              data: base64,
              mimeType: 'image/png' as const,
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
