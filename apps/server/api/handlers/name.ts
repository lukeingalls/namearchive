import { generateNameTrendPoints, validatePotentialName } from "../../ai/gemini-name-generation";
import {
  addInvalidName,
  getNamePageData,
  insertOrUpdateGeneratedName,
  isInvalidName,
} from "../../db";
import type { RouteContext } from "../../router/path-router";
import { json } from "../utils";

function normalizedCandidate(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 64);
}

export async function handleNameApi(
  context: RouteContext,
  _req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
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
    json(
      res,
      {
        error: "Name not found",
        details:
          error instanceof Error ? error.message : "Unable to resolve name at this time",
      },
      404,
    );
    return;
  }

  json(res, data);
}
