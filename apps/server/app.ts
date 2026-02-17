import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ViteDevServer } from "vite";
import { registerApiRoutes } from "./api/register-routes";
import { registerPageRoutes } from "./pages/register-routes";
import { PathRouter } from "./router/path-router";

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(serverRoot, "../client");

function requestOrigin(
  req: import("node:http").IncomingMessage,
  defaultPort: number,
): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : (forwardedProto ?? "http");

  const hostHeader = req.headers.host ?? `localhost:${defaultPort}`;
  return `${protocol}://${hostHeader}`;
}

interface CreateRequestHandlerOptions {
  port: number;
  vite: ViteDevServer | null;
}

export function createRequestHandler(options: CreateRequestHandlerOptions) {
  const { port, vite } = options;
  const router = new PathRouter();
  registerApiRoutes(router);
  registerPageRoutes(router, { serverRoot, clientRoot, vite });

  return async (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ) => {
    const origin = requestOrigin(req, port);
    const parsedUrl = new URL(req.url ?? "/", origin);
    const pathname = parsedUrl.pathname;
    const search = parsedUrl.search;

    try {
      const handled = await router.handle(
        {
          method: req.method ?? "GET",
          pathname,
          search,
          requestOrigin: origin,
          pathnameWithSearch: `${pathname}${search}`,
        },
        req,
        res,
      );

      if (!handled) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Not found");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? (error.stack ?? error.message)
          : "Unknown server error";
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end(message);
    }
  };
}
