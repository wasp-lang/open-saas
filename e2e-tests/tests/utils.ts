import { test as base, type Page } from '@playwright/test';
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
  console.log('user.email', user.email, 'DEFAULT_PASSWORD', DEFAULT_PASSWORD)

  const clickLogin = page.click('button:has-text("Log in")');

  await Promise.all([
    page.waitForResponse((response) => {
      console.log('<><><> response.url()', response.url(), response.status());
      return response.url().includes('login') && response.status() === 200;
    }),
    clickLogin,
  ]);

  await page.waitForURL('**/demo-app');
};

export const signUserUp = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Log in' }).click();

  await page.click('text="go to signup"');

  await page.fill('input[name="email"]', user.email);

  await page.fill('input[name="password"]', DEFAULT_PASSWORD);

  await page.click('button:has-text("Sign up")');

  await page.waitForResponse((response) => {
    return response.url().includes('signup') && response.status() === 200;
  });
};

export const createRandomUser = () => {
  const email = `${randomUUID()}@test.com`;
  return { email, password: DEFAULT_PASSWORD } as User;
};
