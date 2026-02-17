import { getHomeData } from "../../db";
import { json } from "../utils";

export function handleHomeApi(
  _context: unknown,
  _req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  json(res, getHomeData());
}
