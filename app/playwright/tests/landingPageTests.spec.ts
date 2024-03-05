import { test, expect } from '@playwright/test';

test.describe('general landing page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('localhost:3000');
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/SaaS/);
  });

  test('get started link', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();
  });

  test('headings', async ({ page }) => {
    expect(page.getByRole('heading', { name: 'SaaS' })).toBeTruthy();
    expect(page.getByRole('heading', { name: 'Features' })).toBeTruthy();
  });
});
