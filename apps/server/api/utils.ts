export function json(
  res: import("node:http").ServerResponse,
  body: unknown,
  statusCode = 200,
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
