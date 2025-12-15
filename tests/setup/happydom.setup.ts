// happy-dom 环境初始化（components）
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

// Node 环境下 fetch 不接受相对 URL（如 "/api/xxx"），因此在测试中统一设置为绝对 baseUrl
// 这样 service 层可以保持与浏览器一致的路径拼接方式。
process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost/api";

import { server } from "../msw/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});


