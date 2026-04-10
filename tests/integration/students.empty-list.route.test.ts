import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTestDatabase } from "../setup/test-db";

describe("API /students GET empty state (integration)", () => {
  beforeEach(async () => {
    vi.resetModules();
    useTestDatabase("students-empty-list");
    const { prisma } = await import("@/lib/prisma");
    await prisma.student.deleteMany();
  });

  it("GET returns empty list with total 0", async () => {
    const { GET } = await import("@/app/api/students/route");
    const res = await GET(new Request("http://localhost/api/students?page=1&page_size=10"));

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      code: number;
      data: { items: unknown[]; page: number; page_size: number; total: number };
    };
    expect(json.code).toBe(0);
    expect(json.data.total).toBe(0);
    expect(json.data.items).toEqual([]);
    expect(json.data.page).toBe(1);
    expect(json.data.page_size).toBe(10);
  });
});
