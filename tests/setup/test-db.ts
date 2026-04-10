import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const ensureDatabase = (name: string) => {
  const tmpDir = path.join(process.cwd(), "tests", "setup", ".tmp");
  mkdirSync(tmpDir, { recursive: true });
  const filename = path.join(tmpDir, `${name}.db`);
  process.env.DATABASE_URL = `file:${filename}`;
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
  return filename;
};

export const useTestDatabase = (name: string) => {
  const filename = ensureDatabase(name);
  const globalAny = globalThis as typeof globalThis & { prisma?: unknown };
  delete globalAny.prisma;
  return filename;
};
