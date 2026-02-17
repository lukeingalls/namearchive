import fs from "node:fs/promises";
import path from "node:path";
import type { RouteContext } from "../../router/path-router";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".html": "text/html",
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath);
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export function createStaticAssetHandler(clientRoot: string) {
  return async function handleStaticAssets(
    context: RouteContext,
    _req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ) {
    const assetPathParam = context.params["*"] ?? "";
    const assetPath = path.join(clientRoot, "dist/client/assets", assetPathParam);

    try {
      const body = await fs.readFile(assetPath);
      res.statusCode = 200;
      res.setHeader("Content-Type", contentTypeFor(assetPath));
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Not found");
    }
  };
}
