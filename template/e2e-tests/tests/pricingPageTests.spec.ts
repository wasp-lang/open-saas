import { expect, test, type Page } from "@playwright/test";
import {
  acceptAllCookies,
  createRandomUser,
  logUserIn,
  makeStripePayment,
  signUserUp,
  type User,
} from "./utils";

let page: Page;
let testUser: User;

async function createAndLogInNewUser() {
  testUser = createRandomUser();
  await signUserUp({ page: page, user: testUser });
  await logUserIn({ page: page, user: testUser });
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test("User should see Log in to subscribe button", async () => {
  await page.goto("/pricing");
  const subscribeButton = page
    .getByRole("button", { name: "Log in to subscribe" })
    .first();
  await expect(subscribeButton).toBeVisible();
  await expect(subscribeButton).toBeEnabled();
  await subscribeButton.click();
  await page.waitForURL("**/login");
  expect(page.url()).toContain("/login");
});

test("User should see Subscribe button after logging in", async () => {
  await createAndLogInNewUser();
  await page.goto("/pricing");
  const subscribeButton = page
    .getByRole("button", { name: "Subscribe" })
    .first();
  await expect(subscribeButton).toBeVisible();
  await expect(subscribeButton).toBeEnabled();
});

test("Make test payment with Stripe for Starter plan", async () => {
  const planId = "starter";
  await page.goto("/");
  await makeStripePayment({ test, page, planId });
});

test("User should see Manage Subscription button after payment", async () => {
  await page.goto("/pricing");
  const manageSubscriptionButton = page
    .getByRole("button", { name: "Manage Subscription" })
    .first();
  await expect(manageSubscriptionButton).toBeVisible();
  await expect(manageSubscriptionButton).toBeEnabled();
  await manageSubscriptionButton.click();
  const newTabPromise = page.waitForEvent("popup");
  const newTab = await newTabPromise;
  await newTab.waitForLoadState();
  await expect(newTab).toHaveURL(/^https:\/\/billing\.stripe\.com\//);
});

test("Make test payment with Stripe for 25-credit pack", async () => {
  await createAndLogInNewUser();
  await acceptAllCookies(page);
  const planId = "credits25";
  await page.goto("/");
  await makeStripePayment({ test, page, planId });
});
