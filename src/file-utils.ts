import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { platform } from 'os';

const DEFAULT_OUTPUT_DIR = join(process.cwd(), 'charts');

export function getDefaultOutputPath(chartType: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return join(DEFAULT_OUTPUT_DIR, `${chartType}-${timestamp}.png`);
}

export async function saveChart(buffer: Buffer, outputPath: string): Promise<void> {
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(outputPath, buffer);
  console.error(`Chart saved to: ${outputPath}`);
}

export function openChart(filePath: string): void {
  const plat = platform();

  let command: string;
  let args: string[];

  switch (plat) {
    case 'darwin':
      command = 'open';
      args = [filePath];
      break;
    case 'win32':
      command = 'cmd';
      args = ['/c', 'start', '', filePath];
      break;
    default:
      command = 'xdg-open';
      args = [filePath];
      break;
  }

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    console.error(`Opened chart: ${filePath}`);
  } catch (error) {
    console.error(
      `Failed to open chart: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
