import type { PathRouter } from "../router/path-router";
import { createOgImageHandler } from "./handlers/og-image";
import { createRenderPageHandler } from "./handlers/render-page";
import { createStaticAssetHandler } from "./handlers/static-assets";

interface RegisterPageRoutesOptions {
  serverRoot: string;
  clientRoot: string;
}

export function registerPageRoutes(
  router: PathRouter,
  options: RegisterPageRoutesOptions,
) {
  router.on("GET", "/og/name/:name.png", createOgImageHandler(options.serverRoot));
  router.on("GET", "/assets/*", createStaticAssetHandler(options.clientRoot));
  router.on(
    "GET",
    "/*",
    createRenderPageHandler({
      serverRoot: options.serverRoot,
      clientRoot: options.clientRoot,
    }),
  );
}
