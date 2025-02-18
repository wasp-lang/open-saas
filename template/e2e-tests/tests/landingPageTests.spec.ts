import { test, expect, Cookie } from '@playwright/test';

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

    const areGaCookiesSet = (cookies: Cookie[]) => {
      const gaCookiesArr = cookies.filter((c) => c.name.startsWith('_ga'));
      return gaCookiesArr.length === 2; // GA cookies are _ga and _ga_<GA_ANALYTICS_ID>
    };

    const startTime = Date.now();
    const MAX_TIME_MS = 10000;
    let timeElapsed = 0;

    while (!areGaCookiesSet(cookies) && timeElapsed < MAX_TIME_MS) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second before checking again
      cookies = await context.cookies();
      timeElapsed = Date.now() - startTime;
    }

    expect(timeElapsed).toBeLessThan(MAX_TIME_MS);
  });
});
