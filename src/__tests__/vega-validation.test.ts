import { describe, it, expect } from 'vitest';
import {
  validateVegaInput,
  VegaValidationError,
} from '../vega-validation.js';
import { VegaChartInput } from '../vega-renderer.js';

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

describe('validateVegaInput', () => {
  it('accepts valid Vega-Lite spec', () => {
    expect(() => validateVegaInput(makeInput())).not.toThrow();
  });

  it('rejects null spec', () => {
    expect(() =>
      validateVegaInput({ spec: null as any }),
    ).toThrow(VegaValidationError);
    expect(() =>
      validateVegaInput({ spec: null as any }),
    ).toThrow('spec must be a JSON object');
  });

  it('rejects array spec', () => {
    expect(() =>
      validateVegaInput({ spec: [] as any }),
    ).toThrow('spec must be a JSON object');
  });

  it('rejects spec without mark or composition operator', () => {
    expect(() =>
      validateVegaInput({ spec: { data: { values: [] } } }),
    ).toThrow("must contain a 'mark' field");
  });

  it('rejects unit spec without encoding', () => {
    expect(() =>
      validateVegaInput({
        spec: { mark: 'bar', data: { values: [{ a: 1 }] } },
      }),
    ).toThrow("has a 'mark' but no 'encoding'");
  });

  it('rejects raw Vega spec with helpful message', () => {
    expect(() =>
      validateVegaInput({
        spec: {
          $schema: 'https://vega.github.io/schema/vega/v5.json',
          marks: [],
        },
      }),
    ).toThrow('raw Vega spec, not Vega-Lite');
  });

  it('accepts Vega-Lite $schema', () => {
    expect(() =>
      validateVegaInput(
        makeInput({
          spec: {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            mark: 'bar',
            encoding: {
              x: { field: 'a', type: 'nominal' },
            },
            data: { values: [{ a: 'A' }] },
          },
        }),
      ),
    ).not.toThrow();
  });

  it('rejects non-array data.values', () => {
    expect(() =>
      validateVegaInput({
        spec: {
          mark: 'bar',
          encoding: { x: { field: 'a' } },
          data: { values: 'not-an-array' },
        },
      }),
    ).toThrow('data.values must be an array');
  });

  it('rejects width out of range', () => {
    expect(() => validateVegaInput(makeInput({ width: 10 }))).toThrow(
      'Width must be between 50 and 4096',
    );
  });

  it('rejects height out of range', () => {
    expect(() =>
      validateVegaInput(makeInput({ height: 5000 })),
    ).toThrow('Height must be between 50 and 4096');
  });

  it('validates spec-embedded width when no override', () => {
    expect(() =>
      validateVegaInput({
        spec: {
          mark: 'bar',
          encoding: { x: { field: 'a' } },
          width: 10,
        },
      }),
    ).toThrow('Width must be between 50 and 4096');
  });

  it('accepts spec with layer composition', () => {
    expect(() =>
      validateVegaInput({
        spec: {
          layer: [
            {
              mark: 'bar',
              encoding: { x: { field: 'a' } },
            },
          ],
        },
      }),
    ).not.toThrow();
  });

  it('accepts spec with hconcat composition', () => {
    expect(() =>
      validateVegaInput({
        spec: {
          hconcat: [
            {
              mark: 'bar',
              encoding: { x: { field: 'a' } },
            },
          ],
        },
      }),
    ).not.toThrow();
  });

  it('accepts valid dimensions', () => {
    expect(() =>
      validateVegaInput(makeInput({ width: 800, height: 600 })),
    ).not.toThrow();
  });
});
