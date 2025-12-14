import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Student = Prisma.StudentGetPayload<Prisma.StudentDefaultArgs>;

type ApiResponse<T> = {
  code: number;
  message: string;
  data?: T | null;
};

type StudentsListData = {
  items: Student[];
  page: number;
  page_size: number;
  total: number;
};

type CreateStudentPayload = Prisma.StudentCreateInput;

function ok<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ code: 0, message: "ok", data });
}

function badRequest(msg: string): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ code: 40000, message: msg, data: null }, { status: 400 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Number(searchParams.get("page_size") || "10"));

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      skip,
      take: pageSize,
      orderBy: { id: "asc" },
    }),
    prisma.student.count(),
  ]);

  const payload: StudentsListData = {
    items,
    page,
    page_size: pageSize,
    total,
  };

  return ok(payload);
}

export async function POST(req: Request) {
  let body: CreateStudentPayload;
  try {
    body = (await req.json()) as CreateStudentPayload;
  } catch {
    return badRequest("invalid json body");
  }

  if (!body?.name || !body?.gender || !body?.student_id) {
    return badRequest("name, gender and student_id are required");
  }

  try {
    const newStudent = await prisma.student.create({
      data: {
        name: body.name,
        gender: body.gender,
        age: body.age ?? null,
        student_id: body.student_id,
      },
    });

    return ok(newStudent);
  } catch (e) {
    // student_id unique constraint
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return badRequest("student_id already exists");
    }
    throw e;
  }
}

