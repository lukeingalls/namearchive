import { getNamePageData } from "../../db";
import type { RouteContext } from "../../router/path-router";
import { json } from "../utils";

export function handleNameApi(
  context: RouteContext,
  _req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  const requestedName = context.params.name;
  const data = getNamePageData(requestedName);

  if (!data) {
    json(res, { error: "Name not found" }, 404);
    return;
  }

  json(res, data);
}
