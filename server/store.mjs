import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function root() {
  return process.env.MODEST_DATA_DIR || join(process.cwd(), "data");
}

function safeName(id) {
  const name = String(id || "");
  if (!/^[A-Za-z0-9_-]{6,200}$/.test(name)) {
    throw new Error("Invalid record id");
  }
  return name;
}

function fileFor(bucket, id) {
  return join(root(), bucket, `${safeName(id)}.json`);
}

export function writeRecord(bucket, id, value) {
  const path = fileFor(bucket, id);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2));
  return path;
}

export function readRecord(bucket, id) {
  const path = fileFor(bucket, id);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}
