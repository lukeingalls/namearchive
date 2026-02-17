export interface RouteContext {
  method: string;
  pathname: string;
  search: string;
  params: Record<string, string>;
  requestOrigin: string;
  pathnameWithSearch: string;
}

type RouteHandler = (
  context: RouteContext,
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) => void | Promise<void>;

interface Route {
  method: string;
  pattern: string;
  handler: RouteHandler;
}

function normalize(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return `/${pathname}`;
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function matchPattern(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const normalizedPattern = normalize(pattern);
  const normalizedPathname = normalize(pathname);

  const patternSegments = normalizedPattern.split("/").filter(Boolean);
  const pathSegments = normalizedPathname.split("/").filter(Boolean);

  const params: Record<string, string> = {};
  let i = 0;
  let j = 0;

  while (i < patternSegments.length && j < pathSegments.length) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[j];

    if (patternSegment === "*") {
      params["*"] = decodeURIComponent(pathSegments.slice(j).join("/"));
      return params;
    }

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
      i += 1;
      j += 1;
      continue;
    }

    if (patternSegment !== pathSegment) {
      return null;
    }

    i += 1;
    j += 1;
  }

  if (i < patternSegments.length && patternSegments[i] === "*") {
    params["*"] = "";
    i += 1;
  }

  if (i !== patternSegments.length || j !== pathSegments.length) {
    return null;
  }

  return params;
}

export class PathRouter {
  private readonly routes: Route[] = [];

  on(method: string, pattern: string, handler: RouteHandler) {
    this.routes.push({
      method: method.toUpperCase(),
      pattern,
      handler,
    });
  }

  async handle(
    context: Omit<RouteContext, "params">,
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ): Promise<boolean> {
    for (const route of this.routes) {
      if (route.method !== context.method.toUpperCase()) {
        continue;
      }

      const params = matchPattern(route.pattern, context.pathname);
      if (!params) {
        continue;
      }

      await route.handler({ ...context, params }, req, res);
      return true;
    }

    return false;
  }
}
