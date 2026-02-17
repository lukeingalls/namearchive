import { getAllNames } from "../../db";
import { json } from "../utils";

export function handleNamesApi(
  _context: unknown,
  _req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  json(res, { names: getAllNames() });
}
