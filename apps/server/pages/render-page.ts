import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ViteDevServer } from "vite";
import { getPageMeta, renderHeadTags } from "./meta";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface RenderPageArgs {
  clientRoot: string;
  pathname: string;
  pathnameWithSearch: string;
  origin: string;
  vite: ViteDevServer | null;
  res: import("node:http").ServerResponse;
}

export async function renderPage(args: RenderPageArgs) {
  const { clientRoot, pathname, pathnameWithSearch, origin, vite, res } = args;
  let template: string;
  let render: (url: string) => string | Promise<string>;

  if (vite) {
    template = await fs.readFile(path.join(clientRoot, "index.html"), "utf-8");
    template = await vite.transformIndexHtml(pathnameWithSearch, template);
    const entry = await vite.ssrLoadModule("/src/entry-server.tsx");
    render = entry.render as (url: string) => string | Promise<string>;
  } else {
    template = await fs.readFile(
      path.join(clientRoot, "dist/client/index.html"),
      "utf-8",
    );
    const serverEntryPath = path.join(clientRoot, "dist/server/entry-server.js");
    const entry = await import(pathToFileURL(serverEntryPath).href);
    render = entry.render as (url: string) => string | Promise<string>;
  }

  const meta = getPageMeta(pathname, origin);
  const headTags = renderHeadTags(pathname, origin, meta);
  const appHtml = await render(pathnameWithSearch);

  const html = template
    .replace("<!--ssr-outlet-->", appHtml)
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(meta.title)}</title>`,
    )
    .replace("<!--head-tags-->", headTags);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(html);
}
