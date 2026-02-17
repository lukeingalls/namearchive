import { generateNameTrendPoints, validatePotentialName } from "../../ai/gemini-name-generation";
import {
  addInvalidName,
  getNamePageData,
  insertOrUpdateGeneratedName,
  isInvalidName,
} from "../../db";
import type { RouteContext } from "../../router/path-router";
import { json } from "../utils";

const NAME_API_RATE_LIMIT_WINDOW_MS = Number(process.env.NAME_API_RATE_LIMIT_WINDOW_MS ?? 60000);
const NAME_API_RATE_LIMIT_MAX = Number(process.env.NAME_API_RATE_LIMIT_MAX ?? 30);
const rateWindowByIp = new Map<string, { count: number; windowStart: number }>();

function normalizedCandidate(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 64);
}

function clientIp(req: import("node:http").IncomingMessage): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = rateWindowByIp.get(ip);
  if (!existing || now - existing.windowStart > NAME_API_RATE_LIMIT_WINDOW_MS) {
    rateWindowByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }
  existing.count += 1;
  return existing.count > NAME_API_RATE_LIMIT_MAX;
}

export async function handleNameApi(
  context: RouteContext,
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  if (isRateLimited(clientIp(req))) {
    json(
      res,
      {
        error: "Too many requests",
        details: "Rate limit exceeded for name generation. Please retry shortly.",
      },
      429,
    );
    return;
  }

  const requestedName = normalizedCandidate(context.params.name ?? "");
  if (!requestedName) {
    json(res, { error: "Name not found" }, 404);
    return;
  }

  let data = getNamePageData(requestedName);
  if (data) {
    json(res, data);
    return;
  }

  if (isInvalidName(requestedName)) {
    json(res, { error: "Name not found" }, 404);
    return;
  }

  try {
    const validation = await validatePotentialName(requestedName);
    if (!validation.isValidName) {
      addInvalidName(requestedName, validation.reason);
      json(res, { error: "Name not found" }, 404);
      return;
    }

    const generated = await generateNameTrendPoints(requestedName);
    insertOrUpdateGeneratedName(requestedName, generated.points);

    data = getNamePageData(requestedName);
    if (!data) {
      json(res, { error: "Name not found" }, 404);
      return;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to resolve name at this time";
    const isQuotaOrRateError =
      message.includes("status 429") || message.toLowerCase().includes("rate limit");
    const isTimeoutOrUpstreamError =
      message.toLowerCase().includes("timed out") || message.includes("status 5");

    json(
      res,
      {
        error: isQuotaOrRateError
          ? "Rate limit exceeded"
          : isTimeoutOrUpstreamError
            ? "Temporary upstream error"
            : "Name not found",
        details: message,
      },
      isQuotaOrRateError ? 429 : isTimeoutOrUpstreamError ? 503 : 404,
    );
    return;
  }

  json(res, data);
}
