import { describe, it, expect, afterEach } from 'vitest';
import { getDefaultOutputPath, saveChart } from '../file-utils.js';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output');

afterEach(() => {
  if (existsSync(TEST_OUTPUT_DIR)) {
    rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
});

describe('getDefaultOutputPath', () => {
  it('includes chart type in the filename', () => {
    const path = getDefaultOutputPath('bar');
    expect(path).toContain('bar-');
    expect(path).toMatch(/\.png$/);
  });

  it('includes timestamp in the filename', () => {
    const path = getDefaultOutputPath('line');
    // ISO timestamp has year-month-day pattern
    expect(path).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('returns path under charts directory', () => {
    const path = getDefaultOutputPath('pie');
    expect(path).toContain('charts');
  });

  it('uses svg extension when specified', () => {
    const path = getDefaultOutputPath('bar', 'svg');
    expect(path).toMatch(/\.svg$/);
  });

  it('defaults to png extension', () => {
    const path = getDefaultOutputPath('bar');
    expect(path).toMatch(/\.png$/);
  });
});

describe('saveChart', () => {
  it('creates the output directory and saves the file', async () => {
    const testPath = join(TEST_OUTPUT_DIR, 'test-chart.png');
    const buffer = Buffer.from('fake png data');

    await saveChart(buffer, testPath);

    expect(existsSync(testPath)).toBe(true);
  });

  it('creates nested directories', async () => {
    const testPath = join(TEST_OUTPUT_DIR, 'nested', 'deep', 'chart.png');
    const buffer = Buffer.from('fake png data');

    await saveChart(buffer, testPath);

    expect(existsSync(testPath)).toBe(true);
  });
});
