import { expect, type Page } from "@playwright/test";
import { randomUUID } from "crypto";

export type User = {
  id?: number;
  email: string;
  password?: string;
};

const DEFAULT_PASSWORD = "password123";

export const logUserIn = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', DEFAULT_PASSWORD);

  const clickLogin = page.click('button:has-text("Log in")');

  await Promise.all([
    page
      .waitForResponse((response) => {
        return response.url().includes("login") && response.status() === 200;
      })
      .catch((err) => console.error(err.message)),
    clickLogin,
  ]);

  await page.waitForURL("**/demo-app");
};

export const signUserUp = async ({
  page,
  user,
}: {
  page: Page;
  user: User;
}) => {
  await page.goto("/signup", { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    try {
      const sessionId = localStorage.getItem("wasp:sessionId");
      if (sessionId) {
        localStorage.removeItem("wasp:sessionId");
      }
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }
  });

  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', DEFAULT_PASSWORD);

  const clickSignup = page.click('button:has-text("Sign up")');

  await Promise.all([
    page
      .waitForResponse((response) => {
        return response.url().includes("signup") && response.status() === 200;
      })
      .catch((err) => console.error(err.message)),
    clickSignup,
  ]);
};

export const createRandomUser = () => {
  const email = `${randomUUID()}@test.com`;
  return { email, password: DEFAULT_PASSWORD } as User;
};

const getNextYearLastTwoDigits = () => {
  const nextYear = new Date().getFullYear() + 1;
  return nextYear.toString().slice(-2);
};

export const makeStripePayment = async ({
  test,
  page,
  planId,
}: {
  test: typeof import("@playwright/test").test;
  page: Page;
  planId: "hobby" | "pro" | "credits10";
}) => {
  test.slow(); // Stripe payments take a long time to confirm and can cause tests to fail so we use a longer timeout

  await page.goto("/pricing");
  await page.waitForURL("**/pricing");

  const buyBtn = page.locator(`button[aria-describedby="${planId}"]`);

  await expect(buyBtn).toBeVisible();
  await expect(buyBtn).toBeEnabled();
  await buyBtn.click();

  await page.waitForURL("https://checkout.stripe.com/**", {
    waitUntil: "domcontentloaded",
  });
  await page.fill('input[name="cardNumber"]', "4242424242424242");
  await page
    .getByPlaceholder("MM / YY")
    .fill(`12${getNextYearLastTwoDigits()}`);
  await page.getByPlaceholder("CVC").fill("123");
  await page.getByPlaceholder("Full name on card").fill("Test User");
  const countrySelect = page.getByLabel("Country or region");
  await countrySelect.selectOption("Germany");
  // This is a weird edge case where the `payBtn` assertion tests pass, but the button click still isn't registered.
  // That's why we wait for stripe responses below to finish loading before clicking the button.
  await page.waitForResponse(
    (response) =>
      response.url().includes("trusted-types-checker") &&
      response.status() === 200,
  );
  const payBtn = page.getByTestId("hosted-payment-submit-button");
  await expect(payBtn).toBeVisible();
  await expect(payBtn).toBeEnabled();
  await payBtn.click();

  await page.waitForURL("**/checkout?status=success");
  await page.waitForURL("**/account");
  if (planId === "credits10") {
    await expect(page.getByText("13 credits")).toBeVisible();
  } else {
    await expect(page.getByText(planId)).toBeVisible();
  }
};

/**
 * The Stripe payment tests need the app to use `stripePaymentProcessor`.
 * Skips them when the e2e run targets another payment processor.
 */
export const skipUnlessStripe = (
  test: typeof import("@playwright/test").test,
) => {
  const paymentProcessor = process.env.E2E_PAYMENT_PROCESSOR ?? "stripe";
  test.skip(
    paymentProcessor !== "stripe",
    `The app is set up with ${paymentProcessor}, not Stripe.`,
  );
};

/**
 * MPT sandbox keys simulate the bank transfer on the MPT checkout page, so the
 * whole flow runs without a bank or a webhook reaching localhost: the app
 * confirms the payment itself when the buyer returns.
 *
 * Two kinds of sandbox key work:
 * - a self-serve sandbox key (`sk_test_…`) simulates any outcome instantly;
 * - a tenant on Monerium's sandbox asks Monerium for a real sandbox SEPA
 *   transfer of the full amount, which takes ~20 s and can only pay.
 */
export const makeMptSandboxPayment = async ({
  test,
  page,
  outcome,
}: {
  test: typeof import("@playwright/test").test;
  page: Page;
  outcome: "paid" | "underpaid";
}) => {
  test.slow();

  await page.goto("/pricing");
  await page.waitForURL("**/pricing");

  const buyBtn = page.locator('button[aria-describedby="credits10"]');
  await expect(buyBtn).toBeVisible();
  await expect(buyBtn).toBeEnabled();
  await buyBtn.click();

  await page.waitForURL(/\/checkout\/[A-Za-z0-9_-]+$/, {
    waitUntil: "domcontentloaded",
  });
  const sessionId = new URL(page.url()).pathname.split("/").pop()!;
  const moneriumSandboxBtn = page.locator('button[onclick="simulateSepa()"]');
  const simulatedOutcomeBtn = page.locator(
    `button[onclick="simulate('${outcome}')"]`,
  );
  await expect(moneriumSandboxBtn.or(simulatedOutcomeBtn)).toBeVisible();

  if (await moneriumSandboxBtn.isVisible()) {
    test.skip(
      outcome !== "paid",
      "A Monerium sandbox transfer always pays the full amount.",
    );
    await moneriumSandboxBtn.click();
    await expect(page.locator("#simMsg")).toContainText("Monerium");
    await page.waitForURL(`**/checkout?session_id=${sessionId}*`, {
      timeout: 90_000,
    });
    return;
  }

  await simulatedOutcomeBtn.click();
  await expect(page.locator("#simMsg")).toContainText(outcome);

  if (outcome === "underpaid") {
    // Only a paid intent sends the buyer back on its own.
    await page.goto(`/checkout?session_id=${sessionId}`);
  }
  await page.waitForURL(`**/checkout?session_id=${sessionId}*`);
};

export const acceptAllCookies = async (page: Page) => {
  await page.waitForSelector('button:has-text("Accept all")');
  await page.click('button:has-text("Accept all")');
};
