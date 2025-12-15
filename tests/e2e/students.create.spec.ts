import { expect, test } from "@playwright/test";

test("新增学生：成功 + 学号唯一约束失败", async ({ page }) => {
  await page.goto("/students-management");

  const genderList = page.locator('[data-slot="select-content"]');

  // 先触发唯一约束失败：使用 seed 中已存在的 student_id（E2E_001）
  await page.locator('input[name="name"]').fill("E2E Duplicate");
  await page.locator('input[name="student_id"]').fill("E2E_001");
  await page.getByRole("combobox", { name: "性别" }).click();
  await expect(genderList).toBeVisible();
  await genderList.locator('[data-slot="select-item"]').filter({ hasText: "男" }).click();
  await page.locator('input[name="age"]').fill("20");
  await page.getByRole("button", { name: "新增" }).click();

  // error toast：withToast 会优先用 Error.message（即后端 message）
  await expect(page.getByText(/student_id already exists|新增失败/)).toBeVisible();

  // 再走成功：换一个新的 student_id
  await page.locator('input[name="name"]').fill("E2E New");
  await page.locator('input[name="student_id"]').fill("E2E_UNIQUE_001");
  await page.getByRole("combobox", { name: "性别" }).click();
  await expect(genderList).toBeVisible();
  await genderList.locator('[data-slot="select-item"]').filter({ hasText: "男" }).click();
  await page.locator('input[name="age"]').fill("21");
  await page.getByRole("button", { name: "新增" }).click();

  // 成功 toast（sonner）文案来自 common.json
  await expect(page.getByText("新增成功")).toBeVisible();
});


