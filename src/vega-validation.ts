import { VegaChartInput } from './vega-renderer.js';

export class VegaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VegaValidationError';
  }
}

const COMPOSITION_OPERATORS = [
  'layer',
  'hconcat',
  'vconcat',
  'concat',
  'facet',
  'repeat',
];

export function validateVegaInput(input: VegaChartInput): void {
  const { spec } = input;

  // Spec must be a non-null, non-array object
  if (spec === null || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new VegaValidationError(
      'spec must be a JSON object containing a Vega-Lite specification.',
    );
  }

  // Detect raw Vega specs (not Vega-Lite)
  if (
    typeof spec.$schema === 'string' &&
    spec.$schema.includes('vega.github.io/schema/vega/') &&
    !spec.$schema.includes('vega-lite')
  ) {
    throw new VegaValidationError(
      'This appears to be a raw Vega spec, not Vega-Lite. The create_vega_chart tool expects a Vega-Lite specification.',
    );
  }

  // Must have mark or a composition operator
  const hasMark = 'mark' in spec;
  const hasComposition = COMPOSITION_OPERATORS.some((op) => op in spec);

  if (!hasMark && !hasComposition) {
    throw new VegaValidationError(
      "Vega-Lite spec must contain a 'mark' field (for unit specs) or a composition operator ('layer', 'hconcat', 'vconcat', 'concat', 'facet', or 'repeat').",
    );
  }

  // Unit specs should have encoding
  if (hasMark && !hasComposition && !('encoding' in spec)) {
    throw new VegaValidationError(
      "Unit spec has a 'mark' but no 'encoding'. Most Vega-Lite charts require an 'encoding' to map data fields to visual channels.",
    );
  }

  // If data.values is present, check it is an array
  if (
    spec.data &&
    typeof spec.data === 'object' &&
    !Array.isArray(spec.data)
  ) {
    const data = spec.data as Record<string, unknown>;
    if ('values' in data && !Array.isArray(data.values)) {
      throw new VegaValidationError('data.values must be an array of data objects.');
    }
  }

  // Validate dimensions (check overrides first, then spec values)
  const width = input.width ?? (spec.width as number | undefined);
  const height = input.height ?? (spec.height as number | undefined);

  if (width !== undefined && (width < 50 || width > 4096)) {
    throw new VegaValidationError(
      `Width must be between 50 and 4096 pixels, got ${width}.`,
    );
  }
  if (height !== undefined && (height < 50 || height > 4096)) {
    throw new VegaValidationError(
      `Height must be between 50 and 4096 pixels, got ${height}.`,
    );
  }
}
