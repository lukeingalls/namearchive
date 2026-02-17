import type { RouteContext } from "../../router/path-router";
import { serveOgImageByName } from "../../og-images";

export function createOgImageHandler(serverRoot: string) {
  return async function handleOgImage(
    context: RouteContext,
    _req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ) {
    const requestedName = context.params.name;
    await serveOgImageByName(serverRoot, requestedName, res);
  };
}
