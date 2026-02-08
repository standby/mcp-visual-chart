import { ChartInput } from './renderer.js';

export class ChartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChartValidationError';
  }
}

const BUBBLE_TYPES = ['bubble'];
const LABEL_REQUIRED_TYPES = ['bar', 'line', 'area', 'radar', 'histogram'];
const XY_TYPES = ['scatter', 'bubble'];

export function validateChartInput(input: ChartInput): void {
  if (input.datasets.length === 0) {
    throw new ChartValidationError('At least one dataset is required.');
  }

  for (let i = 0; i < input.datasets.length; i++) {
    const ds = input.datasets[i];
    const dsName = ds.label ? `"${ds.label}"` : `#${i + 1}`;

    if (ds.data.length === 0) {
      throw new ChartValidationError(
        `Dataset ${dsName} has no data points.`,
      );
    }

    // Bubble charts require {x, y, r} objects
    if (BUBBLE_TYPES.includes(input.type)) {
      for (let j = 0; j < ds.data.length; j++) {
        const point = ds.data[j];
        if (
          typeof point !== 'object' ||
          point === null ||
          !('x' in point) ||
          !('y' in point) ||
          !('r' in point)
        ) {
          throw new ChartValidationError(
            `Dataset ${dsName}, point ${j + 1}: bubble charts require data points with {x, y, r} properties.`,
          );
        }
      }
    }

    // Scatter charts require {x, y} objects
    if (input.type === 'scatter') {
      for (let j = 0; j < ds.data.length; j++) {
        const point = ds.data[j];
        if (
          typeof point !== 'object' ||
          point === null ||
          !('x' in point) ||
          !('y' in point)
        ) {
          throw new ChartValidationError(
            `Dataset ${dsName}, point ${j + 1}: scatter charts require data points with {x, y} properties.`,
          );
        }
      }
    }

    // Label count vs data count mismatch for label-based charts
    if (
      input.labels &&
      LABEL_REQUIRED_TYPES.includes(input.type) &&
      !XY_TYPES.includes(input.type)
    ) {
      if (input.labels.length !== ds.data.length) {
        throw new ChartValidationError(
          `Dataset ${dsName} has ${ds.data.length} data points but ${input.labels.length} labels were provided. These counts should match.`,
        );
      }
    }
  }

  // Validate dimensions
  const width = input.options?.width;
  const height = input.options?.height;
  if (width !== undefined && (width < 50 || width > 4096)) {
    throw new ChartValidationError(
      `Width must be between 50 and 4096 pixels, got ${width}.`,
    );
  }
  if (height !== undefined && (height < 50 || height > 4096)) {
    throw new ChartValidationError(
      `Height must be between 50 and 4096 pixels, got ${height}.`,
    );
  }
}
