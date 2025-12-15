import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth";

type MockFetchResponse = {
  status: number;
  ok?: boolean;
  statusText?: string;
  json?: () => Promise<unknown>;
};

function mockRes(r: MockFetchResponse) {
  return {
    status: r.status,
    ok: r.ok ?? (r.status >= 200 && r.status < 300),
    statusText: r.statusText ?? "",
    json: r.json ?? (async () => ({})),
  } as unknown as Response;
}

describe("service/http", () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it("httpGet 会拼接 query，并在有 token 时带上 Authorization", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockRes({
        status: 200,
        json: async () => ({ code: 0, message: "ok", data: { hello: "world" } }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    setAccessToken("my-token");

    // 动态 import：避免 module cache 影响不同用例（同时确保读取的是当前 stub 的 fetch）
    const { httpGet } = await import("@/service/http");

    const res = await httpGet<{ hello: string }>("/students", { page: 2, size: 10, ignored: undefined, nil: null });

    expect(res.code).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/students\?(.+)&?$/);
    expect(url).toContain("page=2");
    expect(url).toContain("size=10");
    expect(url).not.toContain("ignored=");
    expect(url).not.toContain("nil=");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer my-token");
  });

  it("遇到 401（非 /auth/*）会先 refresh，成功后重放原请求并更新 token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    // 1) 原请求 401
    fetchMock.mockResolvedValueOnce(
      mockRes({
        status: 401,
        json: async () => ({ code: 401, message: "unauthorized", data: null }),
      })
    );
    // 2) refresh 成功（约定总是 200，靠 code 判断）
    fetchMock.mockResolvedValueOnce(
      mockRes({
        status: 200,
        json: async () => ({ code: 0, message: "ok", data: { access_token: "new-token" } }),
      })
    );
    // 3) 重放成功
    fetchMock.mockResolvedValueOnce(
      mockRes({
        status: 200,
        json: async () => ({ code: 0, message: "ok", data: { value: 1 } }),
      })
    );

    setAccessToken("old-token");

    const { httpGet } = await import("@/service/http");
    const res = await httpGet<{ value: number }>("/students", { page: 1 });

    expect(res.code).toBe(0);
    expect(getAccessToken()).toBe("new-token");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [req1Url, req1Init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(req1Url).toContain("/api/students");
    expect((req1Init.headers as Record<string, string>).Authorization).toBe("Bearer old-token");

    const [refreshUrl, refreshInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(refreshUrl).toContain("/api/auth/refresh");
    expect(refreshInit.method).toBe("POST");

    const [req2Url, req2Init] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(req2Url).toContain("/api/students");
    expect((req2Init.headers as Record<string, string>).Authorization).toBe("Bearer new-token");
  });

  it("refresh 失败会清理 token，并返回 code=40100（node 环境不做跳转）", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    // 1) 原请求 401
    fetchMock.mockResolvedValueOnce(
      mockRes({
        status: 401,
        json: async () => ({ code: 401, message: "unauthorized", data: null }),
      })
    );
    // 2) refresh 失败（code != 0 或无 token）
    fetchMock.mockResolvedValueOnce(
      mockRes({
        status: 200,
        json: async () => ({ code: 10001, message: "refresh failed", data: null }),
      })
    );

    setAccessToken("old-token");

    const { httpGet } = await import("@/service/http");
    const res = await httpGet("/students");

    expect(res.code).toBe(40100);
    expect(getAccessToken()).toBe(null);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});


