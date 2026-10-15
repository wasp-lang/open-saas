import { expect, test, type Page } from "@playwright/test";
import {
  acceptAllCookies,
  createRandomUser,
  logUserIn,
  makeMptSandboxPayment,
  signUserUp,
} from "./utils";

// Runs only when the app is set up with MPT sandbox keys (see the MPT guide)
// and `mptPaymentProcessor` is the chosen payment processor.
test.skip(
  process.env.E2E_PAYMENT_PROCESSOR !== "mpt",
  "Set E2E_PAYMENT_PROCESSOR=mpt to run the MPT payment tests.",
);

let page: Page;

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ browser }) => {
  page = await browser.newPage();
  const user = createRandomUser();
  await signUserUp({ page, user });
  await logUserIn({ page, user });
  // Clear the cookie consent modal so it doesn't interfere with the payment.
  await acceptAllCookies(page);
});

test.afterEach(async () => {
  await page.close();
});

test("Pay for 10 credits with a simulated MPT bank transfer", async () => {
  await makeMptSandboxPayment({ test, page, outcome: "paid" });

  await expect(page.getByText("Payment Successful")).toBeVisible({
    timeout: 30_000,
  });
  await page.waitForURL("**/account");
  await expect(page.getByText("13 credits")).toBeVisible();
});

test("An underpaid MPT transfer grants no credits", async () => {
  await makeMptSandboxPayment({ test, page, outcome: "underpaid" });

  await expect(page.getByText("Payment Failed")).toBeVisible({
    timeout: 30_000,
  });
  await page.waitForURL("**/account");
  await expect(page.getByText("3 credits")).toBeVisible();
});
