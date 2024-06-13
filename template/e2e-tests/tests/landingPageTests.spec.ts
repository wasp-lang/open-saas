import { test, expect } from '@playwright/test';

const DOCS_URL = 'https://docs.opensaas.sh';

test.describe('general landing page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/SaaS/);
  });

  test('get started link', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();
    await page.waitForURL(DOCS_URL);
  });

  test('headings', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Frequently asked questions' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Some cool words' })
    ).toBeVisible();
  });
});

test.describe('cookie consent tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('cookie consent banner rejection does not set cc_cookie', async ({
    context,
    page,
  }) => {
    await page.$$('button:has-text("Reject all")');
    await page.click('button:has-text("Reject all")');

    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === 'cc_cookie');
    const cookieObject = JSON.parse(decodeURIComponent(consentCookie.value));
    expect(cookieObject.categories.includes('analytics')).toBeFalsy();
  });

  test('cookie consent banner acceptance sets cc_cookie and _ga cookies', async ({
    context,
    page,
  }) => {
    await page.$$('button:has-text("Accept all")');
    await page.click('button:has-text("Accept all")');

    let cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === 'cc_cookie');
    const cookieObject = JSON.parse(decodeURIComponent(consentCookie.value));
    // Check that the Cookie Consent cookie is set. This should happen immediately, and then the GA cookies will get set after it, dynamically.
    expect(cookieObject.categories.includes('analytics')).toBeTruthy();

    // Wait for Google Analytics cookies to be set after accepting
    const MAX_TIME_MS = 45000;
    const startTime = Date.now();
    while (cookies.length === 1) {
      if (Date.now() - startTime > MAX_TIME_MS) {
        throw new Error('Timeout: Google Analytics cookies not set.');
      }
      cookies = await context.cookies();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    let gaCookiesArr = await context.cookies(); // Call the cookies method again to avoid race condition
    gaCookiesArr = gaCookiesArr.filter((c) => c.name.startsWith('_ga'));
    expect(gaCookiesArr.length).toBe(2);
  });
});