import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../server.js';

describe('MCP integration', () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const server = createServer();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);

    cleanup = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  it('lists both tools', async () => {
    const { tools } = await client.listTools();

    expect(tools).toHaveLength(2);
    const names = tools.map((t) => t.name);
    expect(names).toContain('create_chart');
    expect(names).toContain('create_vega_chart');
  });

  it('creates a bar chart and returns image content', async () => {
    const result = await client.callTool({
      name: 'create_chart',
      arguments: {
        type: 'bar',
        labels: ['A', 'B', 'C'],
        datasets: [{ label: 'Test', data: [10, 20, 30] }],
        options: { title: 'Integration Test' },
        autoOpen: false,
      },
    });

    expect(result.isError).toBeFalsy();
    expect(result.content).toHaveLength(2);

    const imageContent = result.content[0] as {
      type: string;
      data: string;
      mimeType: string;
    };
    expect(imageContent.type).toBe('image');
    expect(imageContent.mimeType).toBe('image/png');
    expect(imageContent.data.length).toBeGreaterThan(100);

    const textContent = result.content[1] as { type: string; text: string };
    expect(textContent.type).toBe('text');
    expect(textContent.text).toContain('Chart saved to:');
  });

  it('creates an SVG chart', async () => {
    const result = await client.callTool({
      name: 'create_chart',
      arguments: {
        type: 'pie',
        labels: ['X', 'Y'],
        datasets: [{ data: [60, 40] }],
        outputFormat: 'svg',
        autoOpen: false,
      },
    });

    expect(result.isError).toBeFalsy();

    const imageContent = result.content[0] as {
      type: string;
      data: string;
      mimeType: string;
    };
    expect(imageContent.mimeType).toBe('image/svg+xml');

    // Decode base64 and verify it's SVG
    const svgString = Buffer.from(imageContent.data, 'base64').toString(
      'utf-8',
    );
    expect(svgString).toContain('<svg');
  });

  it('returns an error for invalid input', async () => {
    const result = await client.callTool({
      name: 'create_chart',
      arguments: {
        type: 'bubble',
        datasets: [{ data: [1, 2, 3] }],
        autoOpen: false,
      },
    });

    expect(result.isError).toBe(true);

    const textContent = result.content[0] as { type: string; text: string };
    expect(textContent.text).toContain('bubble charts require');
  });

  it('creates a Vega-Lite bar chart and returns image content', async () => {
    const result = await client.callTool({
      name: 'create_vega_chart',
      arguments: {
        spec: {
          mark: 'bar',
          data: {
            values: [
              { a: 'A', b: 28 },
              { a: 'B', b: 55 },
            ],
          },
          encoding: {
            x: { field: 'a', type: 'nominal' },
            y: { field: 'b', type: 'quantitative' },
          },
        },
        autoOpen: false,
      },
    });

    expect(result.isError).toBeFalsy();
    expect(result.content).toHaveLength(2);

    const imageContent = result.content[0] as {
      type: string;
      data: string;
      mimeType: string;
    };
    expect(imageContent.type).toBe('image');
    expect(imageContent.mimeType).toBe('image/png');
    expect(imageContent.data.length).toBeGreaterThan(100);

    const textContent = result.content[1] as { type: string; text: string };
    expect(textContent.text).toContain('Chart saved to:');
  });

  it('creates a Vega-Lite SVG chart', async () => {
    const result = await client.callTool({
      name: 'create_vega_chart',
      arguments: {
        spec: {
          mark: 'point',
          data: {
            values: [
              { x: 1, y: 2 },
              { x: 3, y: 4 },
            ],
          },
          encoding: {
            x: { field: 'x', type: 'quantitative' },
            y: { field: 'y', type: 'quantitative' },
          },
        },
        outputFormat: 'svg',
        autoOpen: false,
      },
    });

    expect(result.isError).toBeFalsy();
    const imageContent = result.content[0] as {
      type: string;
      data: string;
      mimeType: string;
    };
    expect(imageContent.mimeType).toBe('image/svg+xml');
    const svgString = Buffer.from(imageContent.data, 'base64').toString(
      'utf-8',
    );
    expect(svgString).toContain('<svg');
  });

  it('returns an error for invalid Vega-Lite spec', async () => {
    const result = await client.callTool({
      name: 'create_vega_chart',
      arguments: {
        spec: { notAValidSpec: true },
        autoOpen: false,
      },
    });

    expect(result.isError).toBe(true);
    const textContent = result.content[0] as { type: string; text: string };
    expect(textContent.text).toContain('Error creating Vega-Lite chart');
  });

  it('returns an error for empty datasets', async () => {
    const result = await client.callTool({
      name: 'create_chart',
      arguments: {
        type: 'bar',
        labels: ['A'],
        datasets: [],
        autoOpen: false,
      },
    });

    expect(result.isError).toBe(true);

    const textContent = result.content[0] as { type: string; text: string };
    expect(textContent.text).toContain('At least one dataset');
  });
});
