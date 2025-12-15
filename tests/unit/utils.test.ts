import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("lib/utils", () => {
  it("cn 会合并 clsx 输入", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("cn 会做 tailwind-merge：后者覆盖前者", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});


