import { describe, it, expect } from 'vitest';
import { renderVegaChart, VegaChartInput } from '../vega-renderer.js';

function makeInput(
  overrides: Partial<VegaChartInput> = {},
): VegaChartInput {
  return {
    spec: {
      mark: 'bar',
      data: {
        values: [
          { a: 'A', b: 28 },
          { a: 'B', b: 55 },
          { a: 'C', b: 43 },
        ],
      },
      encoding: {
        x: { field: 'a', type: 'nominal' },
        y: { field: 'b', type: 'quantitative' },
      },
    },
    ...overrides,
  };
}

describe('renderVegaChart', () => {
  it('renders a basic bar chart to PNG buffer', async () => {
    const { buffer, base64 } = await renderVegaChart(makeInput());

    // PNG magic bytes: 89 50 4E 47
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);

    expect(base64.length).toBeGreaterThan(100);
  });

  it('renders a line chart', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({
        spec: {
          mark: 'line',
          data: {
            values: [
              { x: 1, y: 10 },
              { x: 2, y: 30 },
              { x: 3, y: 20 },
            ],
          },
          encoding: {
            x: { field: 'x', type: 'quantitative' },
            y: { field: 'y', type: 'quantitative' },
          },
        },
      }),
    );

    expect(buffer[0]).toBe(0x89);
  });

  it('renders a layered chart', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({
        spec: {
          data: {
            values: [
              { x: 1, y: 10 },
              { x: 2, y: 30 },
            ],
          },
          layer: [
            {
              mark: 'bar',
              encoding: {
                x: { field: 'x', type: 'ordinal' },
                y: { field: 'y', type: 'quantitative' },
              },
            },
            {
              mark: 'line',
              encoding: {
                x: { field: 'x', type: 'ordinal' },
                y: { field: 'y', type: 'quantitative' },
              },
            },
          ],
        },
      }),
    );

    expect(buffer[0]).toBe(0x89);
  });

  it('renders SVG output when outputFormat is svg', async () => {
    const result = await renderVegaChart(
      makeInput({ outputFormat: 'svg' }),
    );
    const svgString = result.buffer.toString('utf-8');

    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
    expect(result.mimeType).toBe('image/svg+xml');
    expect(result.extension).toBe('svg');
  });

  it('returns PNG metadata by default', async () => {
    const result = await renderVegaChart(makeInput());
    expect(result.mimeType).toBe('image/png');
    expect(result.extension).toBe('png');
  });

  it('applies width/height overrides', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({ width: 600, height: 400 }),
    );
    expect(buffer[0]).toBe(0x89);
  });

  it('applies background override', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({ background: '#f0f0f0' }),
    );
    expect(buffer[0]).toBe(0x89);
  });

  it('uses spec-embedded dimensions when no overrides', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({
        spec: {
          mark: 'bar',
          width: 500,
          height: 350,
          data: { values: [{ a: 'A', b: 10 }] },
          encoding: {
            x: { field: 'a', type: 'nominal' },
            y: { field: 'b', type: 'quantitative' },
          },
        },
      }),
    );
    expect(buffer[0]).toBe(0x89);
  });

  it('renders an arc/pie chart', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({
        spec: {
          mark: { type: 'arc' },
          data: {
            values: [
              { category: 'A', value: 30 },
              { category: 'B', value: 50 },
              { category: 'C', value: 20 },
            ],
          },
          encoding: {
            theta: { field: 'value', type: 'quantitative' },
            color: { field: 'category', type: 'nominal' },
          },
        },
      }),
    );
    expect(buffer[0]).toBe(0x89);
  });

  it('renders a point/scatter chart', async () => {
    const { buffer } = await renderVegaChart(
      makeInput({
        spec: {
          mark: 'point',
          data: {
            values: [
              { x: 1, y: 2 },
              { x: 3, y: 4 },
              { x: 5, y: 1 },
            ],
          },
          encoding: {
            x: { field: 'x', type: 'quantitative' },
            y: { field: 'y', type: 'quantitative' },
          },
        },
      }),
    );
    expect(buffer[0]).toBe(0x89);
  });

  it('throws on invalid Vega-Lite spec', async () => {
    await expect(
      renderVegaChart(
        makeInput({
          spec: {
            mark: 'bar',
            encoding: {
              x: { field: 'a', type: 'INVALID_TYPE' },
            },
          },
        }),
      ),
    ).rejects.toThrow('Vega-Lite compilation failed');
  });
});
