import { describe, it, expect } from 'vitest';
import { renderChart, ChartInput } from '../renderer.js';

describe('renderChart', () => {
  it('renders a basic bar chart to PNG buffer', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A', 'B', 'C'],
      datasets: [{ label: 'Test', data: [10, 20, 30] }],
    };

    const { buffer, base64 } = await renderChart(input);

    // PNG magic bytes: 89 50 4E 47
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);

    // base64 string should be non-empty
    expect(base64.length).toBeGreaterThan(100);
  });

  it('renders a pie chart', async () => {
    const input: ChartInput = {
      type: 'pie',
      labels: ['X', 'Y', 'Z'],
      datasets: [{ data: [40, 30, 30] }],
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89); // PNG
  });

  it('renders a line chart with title', async () => {
    const input: ChartInput = {
      type: 'line',
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Sales', data: [100, 200, 150] }],
      options: { title: 'Monthly Sales' },
    };

    const { buffer } = await renderChart(input);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('renders an area chart (line with fill)', async () => {
    const input: ChartInput = {
      type: 'area',
      labels: ['Q1', 'Q2', 'Q3'],
      datasets: [{ data: [10, 25, 15] }],
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a scatter chart with xy data', async () => {
    const input: ChartInput = {
      type: 'scatter',
      datasets: [
        {
          label: 'Points',
          data: [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 1 },
          ],
        },
      ],
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('respects custom width and height', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A'],
      datasets: [{ data: [10] }],
      options: { width: 400, height: 300 },
    };

    const { buffer } = await renderChart(input);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('renders a horizontal bar chart', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A', 'B'],
      datasets: [{ data: [10, 20] }],
      options: { indexAxis: 'y' },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders stacked bar chart', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A', 'B'],
      datasets: [
        { label: 'Set 1', data: [10, 20] },
        { label: 'Set 2', data: [5, 15] },
      ],
      options: { stacked: true },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a radar chart', async () => {
    const input: ChartInput = {
      type: 'radar',
      labels: ['Speed', 'Power', 'Range', 'Armor', 'Magic'],
      datasets: [{ label: 'Hero', data: [80, 60, 70, 50, 90] }],
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders SVG output when outputFormat is svg', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A', 'B'],
      datasets: [{ data: [10, 20] }],
      outputFormat: 'svg',
    };

    const result = await renderChart(input);
    const svgString = result.buffer.toString('utf-8');

    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
    expect(result.mimeType).toBe('image/svg+xml');
    expect(result.extension).toBe('svg');
  });

  it('returns PNG metadata by default', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A'],
      datasets: [{ data: [10] }],
    };

    const result = await renderChart(input);
    expect(result.mimeType).toBe('image/png');
    expect(result.extension).toBe('png');
  });

  it('renders a chart with logarithmic y-axis', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A', 'B', 'C'],
      datasets: [{ data: [1, 100, 10000] }],
      options: { yAxisType: 'logarithmic' },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a chart with beginAtZero', async () => {
    const input: ChartInput = {
      type: 'line',
      labels: ['A', 'B'],
      datasets: [{ data: [50, 80] }],
      options: { beginAtZero: true },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a smooth line chart with tension', async () => {
    const input: ChartInput = {
      type: 'line',
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{ data: [10, 40, 20, 50] }],
      options: { tension: 0.4 },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a smooth area chart with tension', async () => {
    const input: ChartInput = {
      type: 'area',
      labels: ['Q1', 'Q2', 'Q3'],
      datasets: [{ data: [10, 25, 15] }],
      options: { tension: 0.3 },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a bar chart with data labels', async () => {
    const input: ChartInput = {
      type: 'bar',
      labels: ['A', 'B', 'C'],
      datasets: [{ data: [10, 20, 30] }],
      options: { showDataLabels: true },
    };

    const { buffer } = await renderChart(input);
    expect(buffer[0]).toBe(0x89);
  });
});
