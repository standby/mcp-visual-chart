import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {
  Chart,
  ChartConfiguration,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { applyColorPalette } from './colors.js';

// Register all Chart.js components we need
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface ChartInput {
  type: string;
  labels?: string[];
  datasets: Array<{
    label?: string;
    data: Array<number | { x: number; y: number; r?: number }>;
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    [key: string]: unknown;
  }>;
  options?: {
    title?: string;
    subtitle?: string;
    showLegend?: boolean;
    width?: number;
    height?: number;
    backgroundColor?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    stacked?: boolean;
    indexAxis?: 'x' | 'y';
    [key: string]: unknown;
  };
  outputPath?: string;
  autoOpen?: boolean;
}

export async function renderChart(
  input: ChartInput,
): Promise<{ buffer: Buffer; base64: string }> {
  const width = input.options?.width ?? 800;
  const height = input.options?.height ?? 600;
  const bgColor = input.options?.backgroundColor ?? 'white';

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: bgColor,
  });

  const config = buildChartConfig(input);
  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const base64 = buffer.toString('base64');

  return { buffer, base64 };
}

function resolveChartJsType(
  type: string,
): ChartConfiguration['type'] {
  switch (type) {
    case 'area':
      return 'line';
    case 'histogram':
      return 'bar';
    default:
      return type as ChartConfiguration['type'];
  }
}

function buildChartConfig(input: ChartInput): ChartConfiguration {
  const chartJsType = resolveChartJsType(input.type);
  const datasets = applyColorPalette(input.datasets, input.type);

  // For area charts, enable fill on all datasets
  if (input.type === 'area') {
    for (const ds of datasets) {
      ds.fill = ds.fill ?? true;
    }
  }

  return {
    type: chartJsType,
    data: {
      labels: input.labels,
      datasets: datasets as ChartConfiguration['data']['datasets'],
    },
    options: buildOptions(input),
  };
}

function buildOptions(input: ChartInput): ChartConfiguration['options'] {
  const opts = input.options ?? {};

  const plugins: Record<string, unknown> = {};

  if (opts.title) {
    plugins.title = {
      display: true,
      text: opts.title,
      font: { size: 18, weight: 'bold' as const },
      padding: { bottom: 4 },
    };
  }

  if (opts.subtitle) {
    plugins.subtitle = {
      display: true,
      text: opts.subtitle,
      font: { size: 14 },
      padding: { bottom: 10 },
    };
  }

  plugins.legend = {
    display: opts.showLegend ?? true,
  };

  const result: Record<string, unknown> = {
    responsive: false,
    animation: false,
    plugins,
  };

  if (opts.indexAxis) {
    result.indexAxis = opts.indexAxis;
  }

  const scales = buildScales(input);
  if (scales) {
    result.scales = scales;
  }

  return result as ChartConfiguration['options'];
}

function buildScales(
  input: ChartInput,
): Record<string, unknown> | undefined {
  // No axes for radial/arc charts
  if (['pie', 'doughnut', 'polarArea', 'radar'].includes(input.type)) {
    return undefined;
  }

  const opts = input.options ?? {};
  const scales: Record<string, unknown> = {};

  const xScale: Record<string, unknown> = {};
  if (opts.xAxisLabel) {
    xScale.title = { display: true, text: opts.xAxisLabel };
  }
  if (opts.stacked) {
    xScale.stacked = true;
  }
  if (input.type === 'histogram') {
    xScale.type = 'linear';
  }
  if (Object.keys(xScale).length > 0) {
    scales.x = xScale;
  }

  const yScale: Record<string, unknown> = {};
  if (opts.yAxisLabel) {
    yScale.title = { display: true, text: opts.yAxisLabel };
  }
  if (opts.stacked) {
    yScale.stacked = true;
  }
  if (Object.keys(yScale).length > 0) {
    scales.y = yScale;
  }

  return Object.keys(scales).length > 0 ? scales : undefined;
}
