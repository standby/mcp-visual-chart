import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import type { RenderResult } from './renderer.js';

export { RenderResult };

export interface VegaChartInput {
  spec: Record<string, unknown>;
  width?: number;
  height?: number;
  background?: string;
  outputFormat?: 'png' | 'svg';
  outputPath?: string;
  autoOpen?: boolean;
}

export async function renderVegaChart(
  input: VegaChartInput,
): Promise<RenderResult> {
  const format = input.outputFormat ?? 'png';
  const isSvg = format === 'svg';

  // Deep-clone spec to avoid mutating input
  const spec = JSON.parse(JSON.stringify(input.spec));

  // Apply overrides or defaults
  if (input.width !== undefined) {
    spec.width = input.width;
  } else if (spec.width === undefined) {
    spec.width = 400;
  }

  if (input.height !== undefined) {
    spec.height = input.height;
  } else if (spec.height === undefined) {
    spec.height = 300;
  }

  if (input.background !== undefined) {
    spec.background = input.background;
  } else if (spec.background === undefined) {
    spec.background = 'white';
  }

  // Compile Vega-Lite → Vega
  let vegaSpec: vega.Spec;
  try {
    const compiled = vegaLite.compile(spec);
    vegaSpec = compiled.spec;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    throw new Error(`Vega-Lite compilation failed: ${message}`);
  }

  // Parse and render
  const runtime = vega.parse(vegaSpec);
  const view = new vega.View(runtime, { renderer: 'none' });

  try {
    await view.runAsync();

    let buffer: Buffer;

    if (isSvg) {
      const svgString = await view.toSVG();
      buffer = Buffer.from(svgString, 'utf-8');
    } else {
      const canvas = await view.toCanvas();
      // node-canvas toBuffer returns a Buffer
      buffer = (canvas as any).toBuffer('image/png');
    }

    const base64 = buffer.toString('base64');

    return {
      buffer,
      base64,
      mimeType: isSvg ? 'image/svg+xml' : 'image/png',
      extension: isSvg ? 'svg' : 'png',
    };
  } finally {
    view.finalize();
  }
}
