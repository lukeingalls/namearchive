import fs from 'node:fs/promises';
import path from 'node:path';
import { babyNamesDatabase, availableNames } from '../client/src/app/data/babyNamesData';

export const CURRENT_OG_IMAGE_VERSION = 'v1';

const nameLookup = new Map(availableNames.map((name) => [name.toLowerCase(), name]));

export function resolveName(input: string): string | null {
  if (babyNamesDatabase[input]) {
    return input;
  }

  return nameLookup.get(input.toLowerCase()) ?? null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSparklinePoints(name: string): string {
  const data = babyNamesDatabase[name];
  const sampled = data.filter((_, index) => index % 3 === 0);
  const chartX = 100;
  const chartY = 250;
  const chartWidth = 1000;
  const chartHeight = 260;

  return sampled
    .map((point, index) => {
      const x = chartX + (index / (sampled.length - 1)) * chartWidth;
      const y = chartY + chartHeight - (point.percentage / 100) * chartHeight;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildOgSvg(name: string): string {
  const nameLabel = escapeXml(name);
  const sparklinePoints = buildSparklinePoints(name);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6b5914" />
      <stop offset="100%" stop-color="#8b6914" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#ffffff" />
  <rect x="40" y="40" width="1120" height="550" rx="22" fill="#ebe4d1" stroke="#d4b896" stroke-width="4" />
  <text x="90" y="140" fill="#4a3f2f" font-size="86" font-family="Georgia, serif">${nameLabel}</text>
  <text x="1110" y="140" text-anchor="end" fill="#8b7355" font-size="34" font-family="Georgia, serif">namearchive.org</text>
  <text x="90" y="182" fill="#6b5d4f" font-size="21" font-family="Georgia, serif">Historical popularity trend preview</text>
  <line x1="100" y1="510" x2="1100" y2="510" stroke="#c4a886" stroke-width="2" />
  <line x1="100" y1="250" x2="100" y2="510" stroke="#c4a886" stroke-width="2" />
  <polyline points="${sparklinePoints}" fill="none" stroke="url(#line)" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" />
  <circle cx="1100" cy="510" r="4" fill="#8b6914" />
  <text x="100" y="548" fill="#8b7355" font-size="24" font-family="Georgia, serif">1900</text>
  <text x="1040" y="548" fill="#8b7355" font-size="24" font-family="Georgia, serif">2026</text>
</svg>`;
}

function getOgFilePath(serverRoot: string, name: string): string {
  const encodedName = encodeURIComponent(name);
  return path.join(serverRoot, '.og-cache', CURRENT_OG_IMAGE_VERSION, `${encodedName}.svg`);
}

export async function ensureOgImage(serverRoot: string, name: string): Promise<string | null> {
  const canonicalName = resolveName(name);
  if (!canonicalName) {
    return null;
  }

  const ogDir = path.join(serverRoot, '.og-cache', CURRENT_OG_IMAGE_VERSION);
  await fs.mkdir(ogDir, { recursive: true });

  const filePath = getOgFilePath(serverRoot, canonicalName);

  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    const svg = buildOgSvg(canonicalName);
    await fs.writeFile(filePath, svg, 'utf8');
    return filePath;
  }
}

export async function serveOgImageRequest(
  serverRoot: string,
  pathname: string,
  res: import('node:http').ServerResponse,
): Promise<boolean> {
  const match = pathname.match(/^\/og\/name\/(.+)\.svg$/);
  if (!match) {
    return false;
  }

  const requestedName = decodeURIComponent(match[1]);
  const filePath = await ensureOgImage(serverRoot, requestedName);

  if (!filePath) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Name not found');
    return true;
  }

  const body = await fs.readFile(filePath, 'utf8');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.end(body);
  return true;
}
