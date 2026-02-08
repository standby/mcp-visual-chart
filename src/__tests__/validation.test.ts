import { describe, it, expect } from 'vitest';
import { validateChartInput, ChartValidationError } from '../validation.js';
import { ChartInput } from '../renderer.js';

function makeInput(overrides: Partial<ChartInput> = {}): ChartInput {
  return {
    type: 'bar',
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [1, 2, 3] }],
    ...overrides,
  };
}

describe('validateChartInput', () => {
  it('accepts valid bar chart input', () => {
    expect(() => validateChartInput(makeInput())).not.toThrow();
  });

  it('rejects empty datasets array', () => {
    expect(() => validateChartInput(makeInput({ datasets: [] }))).toThrow(
      ChartValidationError,
    );
    expect(() => validateChartInput(makeInput({ datasets: [] }))).toThrow(
      'At least one dataset is required',
    );
  });

  it('rejects dataset with no data points', () => {
    expect(() =>
      validateChartInput(makeInput({ datasets: [{ data: [] }] })),
    ).toThrow('has no data points');
  });

  it('rejects labels/data count mismatch for bar charts', () => {
    expect(() =>
      validateChartInput(
        makeInput({
          labels: ['A', 'B'],
          datasets: [{ data: [1, 2, 3] }],
        }),
      ),
    ).toThrow('3 data points but 2 labels');
  });

  it('does not check labels/data mismatch for scatter charts', () => {
    expect(() =>
      validateChartInput(
        makeInput({
          type: 'scatter',
          labels: ['A'],
          datasets: [{ data: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }],
        }),
      ),
    ).not.toThrow();
  });

  it('rejects scatter chart with plain numbers', () => {
    expect(() =>
      validateChartInput(
        makeInput({
          type: 'scatter',
          datasets: [{ data: [1, 2, 3] }],
        }),
      ),
    ).toThrow('scatter charts require data points with {x, y}');
  });

  it('rejects bubble chart without r property', () => {
    expect(() =>
      validateChartInput(
        makeInput({
          type: 'bubble',
          datasets: [{ data: [{ x: 1, y: 2 }] }],
        }),
      ),
    ).toThrow('bubble charts require data points with {x, y, r}');
  });

  it('accepts valid bubble chart data', () => {
    expect(() =>
      validateChartInput(
        makeInput({
          type: 'bubble',
          datasets: [{ data: [{ x: 1, y: 2, r: 5 }] }],
        }),
      ),
    ).not.toThrow();
  });

  it('rejects width out of range', () => {
    expect(() =>
      validateChartInput(makeInput({ options: { width: 10 } })),
    ).toThrow('Width must be between 50 and 4096');
  });

  it('rejects height out of range', () => {
    expect(() =>
      validateChartInput(makeInput({ options: { height: 5000 } })),
    ).toThrow('Height must be between 50 and 4096');
  });

  it('accepts valid dimensions', () => {
    expect(() =>
      validateChartInput(makeInput({ options: { width: 1024, height: 768 } })),
    ).not.toThrow();
  });

  it('includes dataset label in error message when available', () => {
    expect(() =>
      validateChartInput(
        makeInput({
          type: 'scatter',
          datasets: [{ label: 'Revenue', data: [1] }],
        }),
      ),
    ).toThrow('"Revenue"');
  });
});
