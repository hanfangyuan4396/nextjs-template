import { expect, test } from "@playwright/test";

test("分页展示：初始数据应为第 1 / 2 页", async ({ page }) => {
  // 等待首个列表请求返回（必须先挂监听，再触发 goto；否则可能“先返回后监听”导致超时）
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/students")),
    page.goto("/students-management"),
  ]);
  expect(resp.ok()).toBe(true);
  const json = (await resp.json()) as { data?: { total?: number } };
  // E2E 共享同一个 e2e.db：如果“新增学生”用例先跑，会额外插入 1 条记录 -> total=12
  // 为避免用例间执行顺序导致的脆弱性，这里允许 11/12。
  expect([11, 12]).toContain(json?.data?.total);

  // seed 了 11 条，page_size=10 -> 共 2 页
  await expect(page.getByText("第 1 / 2 页")).toBeVisible();
  await expect(page.getByText(/共 (11|12) 条/)).toBeVisible();

  // 第 1 页应出现 Student 1，且不出现 Student 11
  await expect(page.getByRole("cell", { name: "Student 1", exact: true })).toBeVisible();
  await expect(page.getByText("Student 11")).toHaveCount(0);

  // 点击 Next -> 第 2 页出现 Student 11
  await page.getByLabel("Go to next page").click();
  await expect(page.getByText("第 2 / 2 页")).toBeVisible();
  await expect(page.getByText("Student 11")).toBeVisible();
});


