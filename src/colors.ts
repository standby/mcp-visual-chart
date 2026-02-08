export const FILL_COLORS = [
  'rgba(54, 162, 235, 0.8)',   // Blue
  'rgba(255, 99, 132, 0.8)',   // Red
  'rgba(75, 192, 192, 0.8)',   // Teal
  'rgba(255, 206, 86, 0.8)',   // Yellow
  'rgba(153, 102, 255, 0.8)',  // Purple
  'rgba(255, 159, 64, 0.8)',   // Orange
  'rgba(201, 203, 207, 0.8)',  // Gray
  'rgba(0, 204, 150, 0.8)',    // Emerald
  'rgba(255, 87, 51, 0.8)',    // Coral
  'rgba(100, 149, 237, 0.8)',  // Cornflower
];

export const BORDER_COLORS = [
  'rgba(54, 162, 235, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(201, 203, 207, 1)',
  'rgba(0, 204, 150, 1)',
  'rgba(255, 87, 51, 1)',
  'rgba(100, 149, 237, 1)',
];

type DatasetInput = {
  label?: string;
  data: unknown[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  [key: string]: unknown;
};

/**
 * Auto-assigns colors to datasets that don't have explicit colors set.
 * For pie/doughnut/polarArea charts, assigns an array of colors per data point.
 * For other charts, assigns one color per dataset.
 */
export function applyColorPalette(
  datasets: DatasetInput[],
  chartType: string,
): DatasetInput[] {
  const isSegmented = ['pie', 'doughnut', 'polarArea'].includes(chartType);

  return datasets.map((dataset, index) => {
    const result = { ...dataset };
    const colorIndex = index % FILL_COLORS.length;

    if (isSegmented) {
      if (!result.backgroundColor) {
        result.backgroundColor = FILL_COLORS.slice(0, result.data.length);
        result.borderColor = BORDER_COLORS.slice(0, result.data.length);
        result.borderWidth = result.borderWidth ?? 1;
      }
    } else {
      if (!result.backgroundColor) {
        result.backgroundColor = FILL_COLORS[colorIndex];
      }
      if (!result.borderColor) {
        result.borderColor = BORDER_COLORS[colorIndex];
      }
      result.borderWidth = result.borderWidth ?? 2;
    }

    return result;
  });
}
