import type { RouteContext } from "../../router/path-router";
import { serveOgImageByName } from "../../og-images";

export function createOgImageHandler(serverRoot: string) {
  return async function handleOgImage(
    context: RouteContext,
    _req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ) {
    const rawName = context.params.name ?? context.params["name.png"] ?? "";
    const requestedName = rawName.endsWith(".png")
      ? rawName.slice(0, -4)
      : rawName;
    if (!requestedName.trim()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Name not found");
      return;
    }
    await serveOgImageByName(serverRoot, requestedName, res);
  };
}
