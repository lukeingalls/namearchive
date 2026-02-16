import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer, type ViteDevServer } from 'vite';

const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 5173);
const cwd = process.cwd();

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

async function tryServeStaticAsset(urlPath: string, res: import('node:http').ServerResponse) {
  if (!urlPath.startsWith('/assets/')) {
    return false;
  }

  const assetPath = path.join(cwd, 'dist/client', urlPath);

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
  url: string,
  vite: ViteDevServer | null,
  res: import('node:http').ServerResponse,
) {
  let template: string;
  let render: (url: string) => string | Promise<string>;

  if (vite) {
    template = await fs.readFile(path.join(cwd, 'index.html'), 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    const entry = await vite.ssrLoadModule('/src/entry-server.tsx');
    render = entry.render;
  } else {
    template = await fs.readFile(path.join(cwd, 'dist/client/index.html'), 'utf-8');
    const entry = await import(path.join(cwd, 'dist/server/entry-server.js'));
    render = entry.render;
  }

  const appHtml = await render(url);
  const html = template.replace('<!--ssr-outlet-->', appHtml);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}

async function start() {
  const vite = isProd
    ? null
    : await createViteServer({
        appType: 'custom',
        server: { middlewareMode: true },
      });

  const server = createHttpServer(async (req, res) => {
    const url = req.url ?? '/';

    try {
      if (vite) {
        vite.middlewares(req, res, async () => {
          await renderPage(url, vite, res);
        });
        return;
      }

      const served = await tryServeStaticAsset(url, res);
      if (served) {
        return;
      }

      await renderPage(url, null, res);
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
