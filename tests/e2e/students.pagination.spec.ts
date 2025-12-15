import { expect, test } from "@playwright/test";

test("分页展示：初始数据应为第 1 / 2 页", async ({ page }) => {
  await page.goto("/students-management");

  // 等待首个列表请求返回（如果这里就是 0，可以快速定位为“后端/DB 没读对”而不是 UI 断言问题）
  const resp = await page.waitForResponse((r) => r.url().includes("/api/students") && r.ok());
  const json = (await resp.json()) as { data?: { total?: number } };
  expect(json?.data?.total).toBe(11);

  // seed 了 11 条，page_size=10 -> 共 2 页
  await expect(page.getByText("第 1 / 2 页")).toBeVisible();
  await expect(page.getByText("共 11 条")).toBeVisible();

  // 第 1 页应出现 Student 1，且不出现 Student 11
  await expect(page.getByText("Student 1")).toBeVisible();
  await expect(page.getByText("Student 11")).toHaveCount(0);

  // 点击 Next -> 第 2 页出现 Student 11
  await page.getByLabel("Go to next page").click();
  await expect(page.getByText("第 2 / 2 页")).toBeVisible();
  await expect(page.getByText("Student 11")).toBeVisible();
});


