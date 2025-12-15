import { beforeEach, describe, expect, it } from "vitest";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Student = Prisma.StudentGetPayload<Prisma.StudentDefaultArgs>;

describe("API /students (integration)", () => {
  beforeEach(async () => {
    // 保证用例之间互不影响
    await prisma.student.deleteMany();
  });

  it("GET returns paginated list", async () => {
    await prisma.student.createMany({
      data: [
        { name: "A", gender: "male", age: 10, student_id: "S001" },
        { name: "B", gender: "female", age: 11, student_id: "S002" },
        { name: "C", gender: "male", age: null, student_id: "S003" },
      ],
    });

    const { GET } = await import("@/app/api/students/route");
    const res = await GET(new Request("http://localhost/api/students?page=1&page_size=2"));

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      code: number;
      data: { page: number; page_size: number; total: number; items: Student[] };
    };
    expect(json.code).toBe(0);
    expect(json.data.page).toBe(1);
    expect(json.data.page_size).toBe(2);
    expect(json.data.total).toBe(3);
    expect(json.data.items).toHaveLength(2);
    expect(json.data.items[0].student_id).toBe("S001");
  });

  it("POST validates required fields", async () => {
    const { POST } = await import("@/app/api/students/route");
    const res = await POST(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "A" }),
      })
    );

    expect(res.status).toBe(400);
    const json = (await res.json()) as { code: number; message: string };
    expect(json.code).toBe(40000);
    expect(json.message).toContain("required");
  });

  it("POST creates student and enforces unique student_id", async () => {
    const { POST } = await import("@/app/api/students/route");

    const payload = { name: "A", gender: "male", age: 10, student_id: "S001" };
    const res1 = await POST(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
    expect(res1.status).toBe(200);
    const json1 = (await res1.json()) as { code: number; data: { student_id: string } };
    expect(json1.code).toBe(0);
    expect(json1.data.student_id).toBe("S001");

    const res2 = await POST(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
    expect(res2.status).toBe(400);
    const json2 = (await res2.json()) as { code: number; message: string };
    expect(json2.code).toBe(40000);
    expect(json2.message).toContain("already exists");
  });
});


