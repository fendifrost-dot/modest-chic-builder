import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { handleRequest } from "./api.mjs";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const DIST = join(process.cwd(), "dist");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function fileFor(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  const relative = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = join(DIST, relative);
  if (!full.startsWith(DIST)) return null;
  return full;
}

function sendFile(res, path, cache) {
  res.statusCode = 200;
  res.setHeader("Content-Type", TYPES[extname(path)] || "application/octet-stream");
  res.setHeader("Cache-Control", cache);
  res.setHeader("X-Content-Type-Options", "nosniff");
  createReadStream(path).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const handled = await handleRequest(req, res);
    if (handled) return;
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.end("Method not allowed");
      return;
    }
    const url = new URL(req.url || "/", "http://localhost");
    const candidate = fileFor(url.pathname);
    if (candidate && existsSync(candidate) && statSync(candidate).isFile()) {
      const hashed = url.pathname.startsWith("/assets/");
      sendFile(res, candidate, hashed ? "public, max-age=31536000, immutable" : "public, max-age=86400");
      return;
    }
    const index = join(DIST, "index.html");
    if (!existsSync(index)) {
      res.statusCode = 500;
      res.end("Build the storefront first: npm run build");
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(index).pipe(res);
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message || "Server error");
  }
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, "0.0.0.0", () => {
  console.log(`MOD#$T storefront listening on ${port}`);
});
