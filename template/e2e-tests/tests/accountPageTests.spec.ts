import { expect, test, type Page } from "@playwright/test";
import { createRandomUser, logUserIn, signUserUp, type User } from "./utils";
import { execSync } from "child_process";

const DB_URL = "postgresql://opensaas:opensaas123@localhost:5434/opensaas_test";

let page: Page;
let testUser: User;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test("Free user sees Free Plan on account page", async () => {
  testUser = createRandomUser();
  await signUserUp({ page, user: testUser });
  await logUserIn({ page, user: testUser });

  await page.goto("/account");
  await page.waitForURL("**/account");

  await expect(page.getByText("Free Plan")).toBeVisible();
});

test("Subscribed user sees billing end date after cancellation", async () => {
  // Give the test user a canceled subscription with a real end date
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  const endDateStr = endDate.toISOString();

  execSync(
    `psql "${DB_URL}" -c "UPDATE \\"User\\" SET \\"subscriptionStatus\\" = 'cancel_at_period_end', \\"subscriptionPlan\\" = 'pro', \\"datePaid\\" = NOW(), \\"subscriptionEndDate\\" = '${endDateStr}' WHERE email = '${testUser.email}';"`,
  );

  await page.goto("/account");
  await page.waitForURL("**/account");

  // Should show the cancellation message with the end date
  const canceledText = page.locator("text=remains active until");
  await expect(canceledText).toBeVisible({ timeout: 10000 });

  const textContent = await canceledText.textContent();
  expect(textContent).not.toContain("Invalid");
  expect(textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
});
