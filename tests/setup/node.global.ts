import { execSync } from "node:child_process";
import type { TestProject } from "vitest/node";

// 只在「node」测试项目启动时执行一次：
// - 固定使用测试库（避免误连 dev.db）
// - 执行 migrate deploy 初始化结构
//
// 之所以放在 globalSetup 而不是 setupFiles：
// setupFiles 会在并行 worker/多个测试文件中重复执行，可能导致 SQLite 并发 migrate 时出现 "database is locked"。
export default function globalSetup(_project: TestProject) {
  process.env.DATABASE_URL ??= "file:./test.db";

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
}
