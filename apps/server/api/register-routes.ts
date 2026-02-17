import type { PathRouter } from "../router/path-router";
import { handleHomeApi } from "./handlers/home";
import { handleNameApi } from "./handlers/name";

export function registerApiRoutes(router: PathRouter) {
  router.on("GET", "/api/home", handleHomeApi);
  router.on("GET", "/api/name/:name", handleNameApi);
}
