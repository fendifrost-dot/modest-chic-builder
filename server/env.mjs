import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Loads .env without printing values. Does not override existing process env. */
export function loadLocalEnv(path = join(process.cwd(), ".env")) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!/^[A-Z0-9_]+$/.test(key)) continue;
    if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
  }
}
