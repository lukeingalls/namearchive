import { createServer as createHttpServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { createRequestHandler } from "./app";

const port = Number(process.env.PORT ?? 5173);
const isProd = process.env.NODE_ENV === "production";
const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(serverRoot, "../client");

async function start() {
  const vite = isProd
    ? null
    : await createViteServer({
        root: clientRoot,
        appType: "custom",
        server: { middlewareMode: true, hmr: false },
      });

  const requestHandler = createRequestHandler({ port, vite });
  const server = createHttpServer((req, res) => {
    if (vite) {
      vite.middlewares(req, res, () => {
        void requestHandler(req, res);
      });
      return;
    }

    void requestHandler(req, res);
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SSR server running at http://localhost:${port}`);
  });
}

void start();
