import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer as createViteServer, type ViteDevServer } from 'vite';
import { serveOgImageRequest, ensureOgImage } from './og-images';
import { getNameFromPath, getPageMeta, renderHeadTags } from './meta';

const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 5173);
const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(serverRoot, '../client');

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.html': 'text/html',
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath);
  return CONTENT_TYPES[ext] ?? 'application/octet-stream';
}

function requestOrigin(req: import('node:http').IncomingMessage): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto ?? 'http';

  const hostHeader = req.headers.host ?? `localhost:${port}`;
  return `${protocol}://${hostHeader}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function tryServeStaticAsset(urlPath: string, res: import('node:http').ServerResponse) {
  if (!urlPath.startsWith('/assets/')) {
    return false;
  }

  const normalizedAssetPath = urlPath.replace(/^\//, '');
  const assetPath = path.join(clientRoot, 'dist/client', normalizedAssetPath);

  try {
    const body = await fs.readFile(assetPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeFor(assetPath));
    res.end(body);
    return true;
  } catch {
    res.statusCode = 404;
    res.end('Not found');
    return true;
  }
}

async function renderPage(
  pathnameWithSearch: string,
  pathname: string,
  origin: string,
  vite: ViteDevServer | null,
  res: import('node:http').ServerResponse,
) {
  let template: string;
  let render: (url: string) => string | Promise<string>;

  if (vite) {
    template = await fs.readFile(path.join(clientRoot, 'index.html'), 'utf-8');
    template = await vite.transformIndexHtml(pathnameWithSearch, template);
    const entry = await vite.ssrLoadModule('/src/entry-server.tsx');
    render = entry.render;
  } else {
    template = await fs.readFile(path.join(clientRoot, 'dist/client/index.html'), 'utf-8');
    const serverEntryPath = path.join(clientRoot, 'dist/server/entry-server.js');
    const entry = await import(pathToFileURL(serverEntryPath).href);
    render = entry.render;
  }

  const meta = getPageMeta(pathname, origin);
  const headTags = renderHeadTags(pathname, origin, meta);
  const appHtml = await render(pathnameWithSearch);

  const html = template
    .replace('<!--ssr-outlet-->', appHtml)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace('<!--head-tags-->', headTags);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}

async function start() {
  const vite = isProd
    ? null
    : await createViteServer({
        root: clientRoot,
        appType: 'custom',
        server: { middlewareMode: true },
      });

  const server = createHttpServer(async (req, res) => {
    const origin = requestOrigin(req);
    const parsedUrl = new URL(req.url ?? '/', origin);
    const pathname = parsedUrl.pathname;
    const pathnameWithSearch = `${parsedUrl.pathname}${parsedUrl.search}`;

    try {
      const servedOg = await serveOgImageRequest(serverRoot, pathname, res);
      if (servedOg) {
        return;
      }

      const requestedName = getNameFromPath(pathname);
      if (requestedName) {
        await ensureOgImage(serverRoot, requestedName);
      }

      if (vite) {
        vite.middlewares(req, res, async () => {
          await renderPage(pathnameWithSearch, pathname, origin, vite, res);
        });
        return;
      }

      const served = await tryServeStaticAsset(pathname, res);
      if (served) {
        return;
      }

      await renderPage(pathnameWithSearch, pathname, origin, null, res);
    } catch (error) {
      if (vite && error instanceof Error) {
        vite.ssrFixStacktrace(error);
      }

      const message = error instanceof Error ? error.stack ?? error.message : 'Unknown server error';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(message);
    }
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SSR server running at http://localhost:${port}`);
  });
}

start();
