import { beforeEach, describe, expect, it } from "vitest";

import { Role, clearAccessToken, getAccessToken, getCurrentUserRole, isAdmin, setAccessToken } from "@/lib/auth";

function base64UrlEncodeUtf8(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function makeJwt(payload: unknown): string {
  const header = base64UrlEncodeUtf8(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = base64UrlEncodeUtf8(JSON.stringify(payload));
  // 这里 signature 随便填一个 base64url 字符串即可（解析 role 只看 payload）
  return `${header}.${body}.sig`;
}

describe("lib/auth", () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it("setAccessToken 会保存 token 并解析出 admin 角色", () => {
    const token = makeJwt({ role: Role.Admin });
    setAccessToken(token);

    expect(getAccessToken()).toBe(token);
    expect(getCurrentUserRole()).toBe(Role.Admin);
    expect(isAdmin()).toBe(true);
  });

  it("未知 role 或 role 非字符串时应解析为 null", () => {
    setAccessToken(makeJwt({ role: "user" }));
    expect(getCurrentUserRole()).toBe(null);
    expect(isAdmin()).toBe(false);

    setAccessToken(makeJwt({ role: 123 }));
    expect(getCurrentUserRole()).toBe(null);
    expect(isAdmin()).toBe(false);
  });

  it("非法 token（不是 3 段）应解析为 null", () => {
    setAccessToken("not-a-jwt");
    expect(getCurrentUserRole()).toBe(null);
    expect(isAdmin()).toBe(false);
  });

  it("clearAccessToken 会清空 token 与角色", () => {
    setAccessToken(makeJwt({ role: Role.Admin }));
    expect(isAdmin()).toBe(true);

    clearAccessToken();
    expect(getAccessToken()).toBe(null);
    expect(getCurrentUserRole()).toBe(null);
    expect(isAdmin()).toBe(false);
  });
});


