import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

// 固定一个不容易和 dev server 冲突的端口，避免被本地已有服务“复用”导致读到错误数据
const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;
// E2E 数据库路径固定，不允许从外部环境变量覆盖（避免不同环境跑到不同库）
// 注意：Next standalone server 会在启动时 chdir 到 .next/standalone，因此这里必须使用“绝对路径”
// 来确保 seed 的 e2e.db 与运行时读取的是同一个文件（仍然固定在仓库根目录的 ./e2e.db）。
// 同时避免“从子目录运行 playwright test”导致 cwd 不同而落到错误位置。
// Playwright 会加载并执行此 config；使用 __dirname（而非 import.meta.url）可避免 ESM/CJS 混用导致的
// `ReferenceError: exports is not defined`。
const ROOT_DIR = __dirname;
const DATABASE_URL = `file:${path.join(ROOT_DIR, "prisma/e2e.db")}`;
// E2E 强制走 Next 内部 Route Handler，避免本机 .env 指向外部后端导致用例不稳定
const NEXT_PUBLIC_API_BASE_URL = "/api";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "zh-CN",
  },
  webServer: {
    // 1) 重置/seed e2e.db（通过 migrations 初始化结构）
    // 2) build + start Next（使用同一个 DATABASE_URL）
    command: [
      `echo "E2E DATABASE_URL=${DATABASE_URL}"`,
      `DATABASE_URL="${DATABASE_URL}" node ./tests/e2e/reset-and-seed.mjs`,
      `NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} npm run build`,
      // Next.js standalone 的 server.js 会在启动时 chdir 到 .next/standalone，
      // 需要把静态资源复制到 standalone 目录中，否则页面无法加载 JS（不 hydrate，导致交互/请求全失效）。
      `rm -rf ./.next/standalone/.next/static && mkdir -p ./.next/standalone/.next && cp -R ./.next/static ./.next/standalone/.next/static`,
      `rm -rf ./.next/standalone/public && cp -R ./public ./.next/standalone/public`,
      // Next 设置 output: "standalone" 时不能用 next start
      `PORT=${PORT} DATABASE_URL="${DATABASE_URL}" NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} node ./.next/standalone/server.js`,
    ].join(" && "),
    url: baseURL,
    // 为保证每次运行都 reset + migrate + seed，这里不复用已有 server
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});


