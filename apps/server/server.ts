import { createServer as createHttpServer } from "node:http";
import { createRequestHandler } from "./app";

const port = Number(process.env.PORT ?? 5173);

const server = createHttpServer(createRequestHandler(port));

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SSR server running at http://localhost:${port}`);
});
