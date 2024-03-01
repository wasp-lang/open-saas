import { test, expect, type Page } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SaaS/);
});

test('get started link', async ({ page }) => {
  await page.goto('localhost:3000');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();
});

test('headings', async ({ page }) => {
  await page.goto('localhost:3000');

  // Expect a visible text "to contain" a substring.
  expect(page.getByRole('heading', { name: 'SaaS' })).toBeTruthy();
  expect(page.getByRole('heading', { name: 'Features' })).toBeTruthy();
})

// test signup with username and password
test('signup', async ({ page }) => {
  await page.goto('localhost:3000');

  // Click the get started link.
  await page.getByRole('link', { name: 'Log in' }).click();

  // click text "Sign up"
  await page.click('text="go to signup"');

  // Fill input[name="username"]
  await page.fill('input[name="username"]', 'user1');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', 'password1');

  // Click button:has-text("Sign up")
  await page.click('button:has-text("Sign up")');
});

const runLogin = async ({ page }: { page: Page }) => {
    // Click the get started link.
  await page.getByRole('link', { name: 'Log in' }).click();

  // Fill input[name="username"]
  await page.fill('input[name="username"]', 'user1');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', 'password1');

  // Click button:has-text("Log in")
  await page.click('button:has-text("Log in")');
}


test('login', async ({ page }) => {
  await page.goto('localhost:3000');

  await runLogin({ page });
})

// test /demo-app page by entering "todo" and clicking add task
test('demo-app', async ({ page }) => {
  await page.goto('localhost:3000');

  await runLogin({ page });

  // find nav bar link that contains text "Demo App" but don't click
  page.getByRole('link', { name: 'Demo App' }).click();

  // Fill input id="description" with "turtle"
  await page.fill('input[id="description"]', 'turtle');

  // Click button:has-text("Add task")
  await page.click('button:has-text("Add task")');

  // expect to find text "turtle" in a span element
  expect(page.getByText('turtle')).toBeTruthy();
});

//