import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
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
          globalSetup: ["./tests/setup/node.global.ts"],
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


