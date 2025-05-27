import { test, expect } from '@playwright/test';

test('register → login → create project → add task', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/register');
  await page.fill('input[name="email"]', 'smoke@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Register")');

  // Login auto-redirect or explicit login
  await page.fill('input[name="email"]', 'smoke@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Log in")');

  // Create project
  await page.click('button:has-text("New Project")');
  await page.fill('input[name="projectName"]', 'Smoke Project');
  await page.click('button:has-text("Save")');

  // Add task
  await page.click('button:has-text("Add Task")');
  await page.fill('input[name="taskTitle"]', 'My first task');
  await page.click('button:has-text("Create")');

  // Verify task appears
  await expect(page.locator('text=My first task')).toBeVisible();
});
