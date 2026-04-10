import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // maxWorkers：限制并行 worker 数量。设为 1 时所有测试文件串行执行，可避免多个用例同时读写
    // 同一 SQLite 文件等共享资源时出现 database is locked 或数据互相干扰。
    // 默认保持注释以利用多核并行；若不用「每套件独立 DB」（tests/setup/test-db.ts）或需临时排查并发问题时，可取消下一行注释。
    // maxWorkers: 1,

    // 按测试分层区分运行时：node vs happy-dom
    projects: [
      {
        plugins: [tsconfigPaths()],
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
        test: {
          name: "node",
          environment: "node",
          include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
          setupFiles: ["./tests/setup/node.setup.ts"],
          restoreMocks: true,
          mockReset: true,
          clearMocks: true,
        },
      },
      {
        plugins: [tsconfigPaths()],
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
        test: {
          name: "components",
          environment: "happy-dom",
          include: ["tests/components/**/*.test.{ts,tsx}"],
          setupFiles: ["./tests/setup/happydom.setup.ts"],
          restoreMocks: true,
          mockReset: true,
          clearMocks: true,
        },
      },
    ],
  },
});


