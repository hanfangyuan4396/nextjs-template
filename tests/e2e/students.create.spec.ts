import { expect, test } from "@playwright/test";

test("新增学生：成功 + 学号唯一约束失败", async ({ page }) => {
  await page.goto("/students-management");

  // 填写表单（使用 name 属性定位，避免受 i18n placeholder 影响）
  await page.locator('input[name="name"]').fill("E2E New");
  await page.locator('input[name="student_id"]').fill("E2E_UNIQUE_001");

  // 选择性别：用 label 精确命中“性别”这个 combobox，避免点到顶部语言切换
  await page.getByRole("combobox", { name: "性别" }).click();
  const genderList = page.locator('[data-slot="select-content"]');
  await expect(genderList).toBeVisible();
  await genderList.locator('[data-slot="select-item"]').filter({ hasText: "男" }).click();

  await page.locator('input[name="age"]').fill("20");
  await page.getByRole("button", { name: "新增" }).click();

  // 成功 toast（sonner）文案来自 common.json
  await expect(page.getByText("新增成功")).toBeVisible();

  // 再次用同一个 student_id 提交，触发唯一约束（后端返回 message: student_id already exists）
  await page.locator('input[name="name"]').fill("E2E New 2");
  await page.locator('input[name="student_id"]').fill("E2E_UNIQUE_001");
  await page.getByRole("combobox", { name: "性别" }).click();
  await expect(genderList).toBeVisible();
  await genderList.locator('[data-slot="select-item"]').filter({ hasText: "男" }).click();
  await page.locator('input[name="age"]').fill("21");
  await page.getByRole("button", { name: "新增" }).click();

  // error toast：withToast 会优先用 Error.message（即后端 message）
  await expect(page.getByText(/student_id already exists|新增失败/)).toBeVisible();
});


