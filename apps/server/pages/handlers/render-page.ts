import type { RouteContext } from "../../router/path-router";
import type { ViteDevServer } from "vite";
import { ensureOgImage } from "../../og-images";
import { getNameFromPath } from "../meta";
import { renderPage } from "../render-page";

interface RenderPageHandlerDeps {
  serverRoot: string;
  clientRoot: string;
  vite: ViteDevServer | null;
}

export function createRenderPageHandler(deps: RenderPageHandlerDeps) {
  return async function handleRenderPage(
    context: RouteContext,
    _req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ) {
    const requestedName = getNameFromPath(context.pathname);
    if (requestedName) {
      await ensureOgImage(deps.serverRoot, requestedName);
    }

    await renderPage({
      clientRoot: deps.clientRoot,
      pathname: context.pathname,
      pathnameWithSearch: context.pathnameWithSearch,
      origin: context.requestOrigin,
      vite: deps.vite,
      res,
    });
  };
}
