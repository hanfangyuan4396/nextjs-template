import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../msw/server";

describe("students service (MSW)", () => {
  it("listStudents() returns data from /api/students", async () => {
    let called = false;

    server.use(
      http.get("*/api/students", ({ request }) => {
        called = true;
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("page_size")).toBe("10");

        return HttpResponse.json({
          code: 0,
          message: "ok",
          data: {
            items: [{ id: 1, name: "Alice", gender: "female", age: 20, student_id: "S001" }],
            page: 1,
            page_size: 10,
            total: 1,
          },
        });
      })
    );

    // 注意：http.ts 在模块初始化时读取 NEXT_PUBLIC_API_BASE_URL
    // 所以这里用 dynamic import，确保拿到 setup 里设定的绝对 baseUrl。
    const { listStudents } = await import("@/service/students");
    const res = await listStudents({ page: 1, page_size: 10 });

    expect(called).toBe(true);
    expect(res.code).toBe(0);
    expect(res.data?.items[0]?.name).toBe("Alice");
  });
});


