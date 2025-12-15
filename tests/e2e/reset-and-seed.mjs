import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// E2E 数据库路径固定（与 playwright.config.ts 保持一致）
const dbFile = path.resolve("e2e.db");
const dbUrl = `file:${dbFile}`;
process.env.DATABASE_URL = dbUrl;

try {
  fs.rmSync(dbFile, { force: true });
} catch {
  // ignore
}

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: dbUrl },
});

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

await prisma.student.deleteMany();

// seed：至少 11 条，方便验证分页（page_size=10）
await prisma.student.createMany({
  data: Array.from({ length: 11 }).map((_, i) => ({
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? "male" : "female",
    age: 18 + (i % 5),
    student_id: `E2E_${String(i + 1).padStart(3, "0")}`,
  })),
});

const count = await prisma.student.count();
console.log(`[e2e] seeded students: ${count}`);

await prisma.$disconnect();


