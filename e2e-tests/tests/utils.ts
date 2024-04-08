import { test as base, type Page, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type User = {
  id?: number;
  username: string;
  password?: string;
  hasPaid?: boolean;
  credits?: number;
};

const DEFAULT_PASSWORD = 'password123';

export const logUserIn = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto('localhost:3000');

  await page.getByRole('link', { name: 'Log in' }).click();

  console.log('logging in...', user);
  await page.waitForURL('http://localhost:3000/login');

  await page.fill('input[name="username"]', user.username);

  await page.fill('input[name="password"]', user.password || DEFAULT_PASSWORD);

  await page.click('button:has-text("Log in")');
};

export const signUserUp = async ({ page, user }: { page: Page; user: User }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Log in' }).click();

  await page.click('text="go to signup"');

  await page.fill('input[name="username"]', user.username);

  await page.fill('input[name="password"]', user.password || DEFAULT_PASSWORD);

  await page.click('button:has-text("Sign up")');
};

export const createRandomUser = () => {
  const username = `user${randomUUID()}`;
  const password = `password${randomUUID()}!`;

  return { username, password };
};

// TODO: change hasPaid to subscriptionStatus
export const createLoggedInUserFixture = ({ hasPaid }: Pick<User, 'hasPaid'>) =>
  base.extend<{ loggedInPage: Page; testUser: User }>({
    testUser: async ({}, use) => {
      const { username, password } = createRandomUser();
      await use({ username, password, hasPaid });
    },
    loggedInPage: async ({ page, testUser }, use) => {
      await signUserUp({ page, user: testUser });
      await page.waitForURL('/demo-app');
      // TODO: try running stripe webhook in CI ✅
      // TODO: complete a payment in `paidUserTests.spec.ts` instead of manually updating the user below ⏳

      if (testUser.hasPaid) {
        await page.click('text="Pricing"');
        await page.click('text="Buy Plan"');
        // wait for stripe payment page to load
        
        await page.fill('input[name="cardNumber"]', '4242424242424242');
        await page.fill('input[name="expiryDate"]', '1225');
        await page.fill('input[name="cvc"]', '123');
        await page.click('button:has-text("Pay")');
        await page.waitForURL('/account');
        await page.click('text="Demo App"');
        await page.waitForURL('/demo-app');
      }

      // const user = await prisma.user.update({
      //   where: { username: testUser.username },
      //   data: { hasPaid: testUser.hasPaid, credits: testUser.credits },
      // });
      await use(page);
    },
  });
