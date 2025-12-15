// Node 环境通用初始化（unit / integration）
// 目标：
// - integration tests 使用独立 SQLite 测试库（prisma/test.db）
// - 通过 migrations 初始化结构（贴近生产/CI）

import { execSync } from "node:child_process";

// 按你的约定：测试 DB 放在仓库根目录
process.env.DATABASE_URL ??= "file:./test.db";

// 避免在同一个 Vitest 进程中重复跑 migration（加速）
const g = globalThis as unknown as { __prisma_migrated__?: boolean };
if (!g.__prisma_migrated__) {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
  g.__prisma_migrated__ = true;
}


