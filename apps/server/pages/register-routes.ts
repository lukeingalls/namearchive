import type { PathRouter } from "../router/path-router";
import type { ViteDevServer } from "vite";
import { createOgImageHandler } from "./handlers/og-image";
import { createRenderPageHandler } from "./handlers/render-page";
import {
  createStaticAssetHandler,
  createStaticFileHandler,
} from "./handlers/static-assets";

interface RegisterPageRoutesOptions {
  serverRoot: string;
  clientRoot: string;
  vite: ViteDevServer | null;
}

export function registerPageRoutes(
  router: PathRouter,
  options: RegisterPageRoutesOptions,
) {
  router.on(
    "GET",
    "/og/name/:name.png",
    createOgImageHandler(options.serverRoot),
  );
  if (!options.vite) {
    router.on("GET", "/assets/*", createStaticAssetHandler(options.clientRoot));
    router.on(
      "GET",
      "/favicon.webp",
      createStaticFileHandler(options.clientRoot, "favicon.webp"),
    );
  }
  router.on(
    "GET",
    "/*",
    createRenderPageHandler({
      serverRoot: options.serverRoot,
      clientRoot: options.clientRoot,
      vite: options.vite,
    }),
  );
}
