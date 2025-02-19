import { type Page, test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

export type User = {
  id?: number;
  email: string;
  password?: string;
};

const DEFAULT_PASSWORD = 'password123';

export const logUserIn = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Log in' }).click();

  await page.waitForURL('**/login', {
    waitUntil: 'domcontentloaded',
  });

  await page.fill('input[name="email"]', user.email);

  await page.fill('input[name="password"]', DEFAULT_PASSWORD);

  const clickLogin = page.click('button:has-text("Log in")');

  await Promise.all([
    page
      .waitForResponse((response) => {
        return response.url().includes('login') && response.status() === 200;
      })
      .catch((err) => console.error(err.message)),
    ,
    clickLogin,
  ]);

  await page.waitForURL('**/demo-app');
};

export const signUserUp = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto('/');
  
  await page.evaluate(() => {
    try {
      const sessionId = localStorage.getItem('wasp:sessionId');
      if (sessionId) {
        localStorage.removeItem('wasp:sessionId');
      }
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  });

  await page.waitForLoadState('domcontentloaded');

  await page.getByRole('link', { name: 'Log in' }).click();

  await page.click('text="go to signup"');

  await page.fill('input[name="email"]', user.email);

  await page.fill('input[name="password"]', DEFAULT_PASSWORD);

  await page.click('button:has-text("Sign up")');

  await page
    .waitForResponse((response) => {
      return response.url().includes('signup') && response.status() === 200;
    })
    .catch((err) => console.error(err.message));
};

export const createRandomUser = () => {
  const email = `${randomUUID()}@test.com`;
  return { email, password: DEFAULT_PASSWORD } as User;
};

export const makeStripePayment = async ({
  test,
  page,
  planId,
}: {
  test: any;
  page: Page;
  planId: 'hobby' | 'pro' | 'credits10';
}) => {
  test.slow(); // Stripe payments take a long time to confirm and can cause tests to fail so we use a longer timeout

  await page.click('text="Pricing"');
  await page.waitForURL('**/pricing');

  const buyBtn = page.locator(`button[aria-describedby="${planId}"]`);

  await expect(buyBtn).toBeVisible();
  await expect(buyBtn).toBeEnabled();
  await buyBtn.click();

  await page.waitForURL('https://checkout.stripe.com/**', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="cardNumber"]', '4242424242424242');
  await page.getByPlaceholder('MM / YY').fill('1225');
  await page.getByPlaceholder('CVC').fill('123');
  await page.getByPlaceholder('Full name on card').fill('Test User');
  const countrySelect = page.getByLabel('Country or region');
  await countrySelect.selectOption('Germany');
  // This is a weird edge case where the `payBtn` assertion tests pass, but the button click still isn't registered.
  // That's why we wait for stripe responses below to finish loading before clicking the button.
  await page.waitForResponse(
    (response) => response.url().includes('trusted-types-checker') && response.status() === 200
  );
  const payBtn = page.getByTestId('hosted-payment-submit-button');
  await expect(payBtn).toBeVisible();
  await expect(payBtn).toBeEnabled();
  await payBtn.click();

  await page.waitForURL('**/checkout?success=true');
  await page.waitForURL('**/account');
  if (planId === 'credits10') {
    await expect(page.getByText('Credits remaining: 13')).toBeVisible();
  } else {
    await expect(page.getByText(planId)).toBeVisible();
  }
};

export const acceptAllCookies = async (page: Page) => {
  await page.waitForSelector('button:has-text("Accept all")');
  await page.click('button:has-text("Accept all")');
};
