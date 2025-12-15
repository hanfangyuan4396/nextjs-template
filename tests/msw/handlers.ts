import { http, HttpResponse } from "msw";

/**
 * 默认 handlers：只放“跨测试通用”的 mock。
 * 单个测试若需定制响应，用 `server.use(...)` 覆盖即可。
 */
export const handlers = [
  http.post("*/api/auth/refresh", () => {
    // 默认不做刷新（避免干扰 service 层测试）；如需覆盖在测试里 server.use 即可
    return HttpResponse.json({ code: 1, message: "refresh disabled in tests", data: null });
  }),
];


