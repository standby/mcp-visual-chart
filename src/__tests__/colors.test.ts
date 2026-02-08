import { describe, it, expect } from 'vitest';
import { applyColorPalette, FILL_COLORS, BORDER_COLORS } from '../colors.js';

describe('applyColorPalette', () => {
  it('assigns a single background and border color per dataset for bar charts', () => {
    const datasets = [
      { data: [1, 2, 3] },
      { data: [4, 5, 6] },
    ];
    const result = applyColorPalette(datasets, 'bar');

    expect(result[0].backgroundColor).toBe(FILL_COLORS[0]);
    expect(result[0].borderColor).toBe(BORDER_COLORS[0]);
    expect(result[1].backgroundColor).toBe(FILL_COLORS[1]);
    expect(result[1].borderColor).toBe(BORDER_COLORS[1]);
  });

  it('assigns per-segment colors for pie charts', () => {
    const datasets = [{ data: [10, 20, 30] }];
    const result = applyColorPalette(datasets, 'pie');

    expect(result[0].backgroundColor).toEqual(FILL_COLORS.slice(0, 3));
    expect(result[0].borderColor).toEqual(BORDER_COLORS.slice(0, 3));
  });

  it('assigns per-segment colors for doughnut charts', () => {
    const datasets = [{ data: [10, 20] }];
    const result = applyColorPalette(datasets, 'doughnut');

    expect(result[0].backgroundColor).toEqual(FILL_COLORS.slice(0, 2));
  });

  it('assigns per-segment colors for polarArea charts', () => {
    const datasets = [{ data: [5, 10, 15, 20] }];
    const result = applyColorPalette(datasets, 'polarArea');

    expect(result[0].backgroundColor).toEqual(FILL_COLORS.slice(0, 4));
  });

  it('does not override user-specified colors', () => {
    const datasets = [
      { data: [1, 2], backgroundColor: 'red', borderColor: 'darkred' },
    ];
    const result = applyColorPalette(datasets, 'bar');

    expect(result[0].backgroundColor).toBe('red');
    expect(result[0].borderColor).toBe('darkred');
  });

  it('does not override user-specified colors for pie charts', () => {
    const datasets = [
      { data: [1, 2], backgroundColor: ['red', 'blue'] },
    ];
    const result = applyColorPalette(datasets, 'pie');

    expect(result[0].backgroundColor).toEqual(['red', 'blue']);
  });

  it('wraps around colors when there are more datasets than palette entries', () => {
    const datasets = Array.from({ length: FILL_COLORS.length + 2 }, () => ({
      data: [1],
    }));
    const result = applyColorPalette(datasets, 'line');

    expect(result[FILL_COLORS.length].backgroundColor).toBe(FILL_COLORS[0]);
    expect(result[FILL_COLORS.length + 1].backgroundColor).toBe(FILL_COLORS[1]);
  });

  it('sets default borderWidth of 2 for non-segmented charts', () => {
    const datasets = [{ data: [1] }];
    const result = applyColorPalette(datasets, 'line');

    expect(result[0].borderWidth).toBe(2);
  });

  it('sets default borderWidth of 1 for segmented charts', () => {
    const datasets = [{ data: [1, 2] }];
    const result = applyColorPalette(datasets, 'pie');

    expect(result[0].borderWidth).toBe(1);
  });

  it('preserves user-specified borderWidth', () => {
    const datasets = [{ data: [1], borderWidth: 5 }];
    const result = applyColorPalette(datasets, 'bar');

    expect(result[0].borderWidth).toBe(5);
  });
});
