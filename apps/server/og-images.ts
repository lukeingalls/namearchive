import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAllNames, getCanonicalName, getNameTrend } from "./db";

export const CURRENT_OG_IMAGE_VERSION = "v3";

const nameLookup = new Map(
  getAllNames().map((name) => [name.toLowerCase(), name]),
);

export function resolveName(input: string): string | null {
  return getCanonicalName(input) ?? nameLookup.get(input.toLowerCase()) ?? null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSparklinePoints(
  data: Array<{ year: number; percentage: number }>,
): string {
  if (!data.length) {
    return "";
  }

  const sampled = data.filter((_, index) => index % 3 === 0);
  const chartX = 100;
  const chartY = 250;
  const chartWidth = 1000;
  const chartHeight = 260;

  return sampled
    .map((point, index) => {
      const denominator = Math.max(sampled.length - 1, 1);
      const x = chartX + (index / denominator) * chartWidth;
      const y = chartY + chartHeight - (point.percentage / 100) * chartHeight;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function averagePercent(
  data: Array<{ year: number; percentage: number }>,
  startIndex: number,
  endIndex: number,
): number {
  let total = 0;
  let count = 0;
  for (let index = startIndex; index < endIndex; index += 1) {
    total += data[index]?.percentage ?? 0;
    count += 1;
  }
  if (count === 0) {
    return 0;
  }
  return total / count;
}

function buildTrendSummary(data: Array<{ year: number; percentage: number }>): {
  color: string;
  label: string;
} {
  if (data.length < 2) {
    return {
      color: "#4d8f5c",
      label: "&#8593; 0% since 1900",
    };
  }

  const recentWindow = Math.min(10, Math.floor(data.length / 2));
  const previousWindow = recentWindow;
  const recentStart = data.length - recentWindow;
  const previousStart = Math.max(0, recentStart - previousWindow);
  const recentAverage = averagePercent(data, recentStart, data.length);
  const previousAverage = averagePercent(data, previousStart, recentStart);
  const base = Math.max(previousAverage, 1);
  const rawChange = ((recentAverage - previousAverage) / base) * 100;
  const percentage = Math.min(999, Math.round(Math.abs(rawChange)));
  const direction: "up" | "down" = rawChange >= 0 ? "up" : "down";
  const color = direction === "up" ? "#4d8f5c" : "#b55a5a";
  const sinceYear = data[recentStart]?.year ?? data[0]?.year ?? 1900;

  return {
    color,
    label: `${direction === "up" ? "&#8593;" : "&#8595;"} ${percentage}% since ${sinceYear}`,
  };
}

function buildOgSvg(name: string): string {
  const nameLabel = escapeXml(name);
  const data = getNameTrend(name);
  const sparklinePoints = buildSparklinePoints(data);
  const trend = buildTrendSummary(data);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8f3e6" />
      <stop offset="100%" stop-color="#e8ddc4" />
    </linearGradient>
    <pattern id="grain" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.8" fill="#8b7355" fill-opacity="0.08" />
      <circle cx="7" cy="4" r="0.7" fill="#8b7355" fill-opacity="0.06" />
      <circle cx="4" cy="10" r="0.6" fill="#8b7355" fill-opacity="0.05" />
      <circle cx="10" cy="9" r="0.7" fill="#8b7355" fill-opacity="0.05" />
    </pattern>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6b5914" />
      <stop offset="100%" stop-color="#8b6914" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#ffffff" />
  <rect x="16" y="16" width="1168" height="598" rx="26" fill="url(#bg)" />
  <rect x="16" y="16" width="1168" height="598" rx="26" fill="url(#grain)" />
  <rect x="40" y="40" width="1120" height="550" rx="22" fill="#ebe4d1" fill-opacity="0.88" stroke="#d4b896" stroke-width="4" />
  <text x="90" y="120" dominant-baseline="middle" fill="#4a3f2f" font-size="86" font-family="Georgia, serif">${nameLabel}</text>
  <text x="1110" y="120" text-anchor="end" dominant-baseline="middle" fill="${trend.color}" font-size="54" font-weight="700" font-family="Georgia, serif">${trend.label}</text>
  <text x="90" y="195" fill="#6b5d4f" font-size="30" font-family="Georgia, serif">Baby Name Trend Since 1900</text>
  <text x="600" y="335" text-anchor="middle" fill="#8b7355" fill-opacity="0.17" font-size="120" font-family="Georgia, serif">namearchive.org</text>
  <line x1="100" y1="510" x2="1100" y2="510" stroke="#c4a886" stroke-width="4" />
  <line x1="100" y1="250" x2="100" y2="510" stroke="#c4a886" stroke-width="4" />
  <polyline points="${sparklinePoints}" fill="none" stroke="url(#line)" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" />
  <circle cx="1100" cy="510" r="4" fill="#8b6914" />
  <text x="100" y="548" fill="#8b7355" font-size="24" font-family="Georgia, serif">1900</text>
  <text x="1040" y="548" fill="#8b7355" font-size="24" font-family="Georgia, serif">2026</text>
</svg>`;
}

function getOgFilePath(serverRoot: string, name: string): string {
  const encodedName = encodeURIComponent(name);
  return path.join(
    serverRoot,
    ".og-cache",
    CURRENT_OG_IMAGE_VERSION,
    `${encodedName}.png`,
  );
}

export async function ensureOgImage(
  serverRoot: string,
  name: string,
): Promise<string | null> {
  const canonicalName = resolveName(name);
  if (!canonicalName) {
    return null;
  }

  const ogDir = path.join(serverRoot, ".og-cache", CURRENT_OG_IMAGE_VERSION);
  await fs.mkdir(ogDir, { recursive: true });

  const filePath = getOgFilePath(serverRoot, canonicalName);

  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    const svg = buildOgSvg(canonicalName);
    await sharp(Buffer.from(svg))
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(filePath);
    return filePath;
  }
}

export async function serveOgImageRequest(
  serverRoot: string,
  pathname: string,
  res: import("node:http").ServerResponse,
): Promise<boolean> {
  const match = pathname.match(/^\/og\/name\/(.+)\.png$/);
  if (!match) {
    return false;
  }

  const requestedName = decodeURIComponent(match[1]);
  const filePath = await ensureOgImage(serverRoot, requestedName);

  if (!filePath) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Name not found");
    return true;
  }

  const body = await fs.readFile(filePath);
  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.end(body);
  return true;
}

export async function serveOgImageByName(
  serverRoot: string,
  requestedName: string,
  res: import("node:http").ServerResponse,
) {
  const filePath = await ensureOgImage(serverRoot, requestedName);

  if (!filePath) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Name not found");
    return;
  }

  const body = await fs.readFile(filePath);
  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.end(body);
}
