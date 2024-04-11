import { test as base, type Page, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

// TODO remove this if not necessary
const prisma = new PrismaClient();

export type User = {
  id?: number;
  email: string;
  password?: string;
  hasPaid?: boolean;
  credits?: number;
};

const DEFAULT_PASSWORD = 'password123';

export const logUserIn = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto('localhost:3000');

  await page.getByRole('link', { name: 'Log in' }).click();

  await page.waitForURL('http://localhost:3000/login', {
    waitUntil: 'domcontentloaded',
  });

  await page.fill('input[name="email"]', user.email);

  await page.fill('input[name="password"]', DEFAULT_PASSWORD);

  const clickLogin = page.click('button:has-text("Log in")');

  await Promise.all([
    page.waitForResponse((response) => {
      return response.url().includes('login') && response.status() === 200;
    }),
    clickLogin,
  ]);

  await page.waitForURL('http://localhost:3000/demo-app');
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
  const password = `password${randomUUID()}!`;
  return { email, password };
};

// TODO: change hasPaid to subscriptionStatus
export const createLoggedInUserFixture = () =>
  base.extend<{ loggedInPage: Page; testUser: User }>({
    testUser: async ({}, use) => {
      const { email, password } = createRandomUser();
      await use({ email, password });
    },
    loggedInPage: async ({ page, testUser }, use) => {
      await signUserUp({ page, user: testUser });
      await logUserIn({ page, user: testUser });

      // TODO: try running stripe webhook in CI ✅
      // TODO: complete a payment in `paidUserTests.spec.ts` instead of manually updating the user below ⏳

      await use(page);
    },
  });
