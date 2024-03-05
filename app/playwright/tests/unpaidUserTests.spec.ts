import { expect } from '@playwright/test';
import { createLoggedInUserFixture } from './utils';

// Create a new test fixture with an unpaid user and a logged in page
const test = createLoggedInUserFixture({ hasPaid: false, credits: 0 });

test('Demo app: cannot generate schedule', async ({ loggedInPage }) => {
  await loggedInPage.waitForURL('http://localhost:3000/demo-app');

  // Fill input id="description" with "create presentation"
  await loggedInPage.fill('input[id="description"]', 'create presentation on SaaS');

  // Click button:has-text("Add task")
  await loggedInPage.click('button:has-text("Add task")');

  await loggedInPage.fill('input[id="description"]', 'build SaaS app draft');

  await loggedInPage.click('button:has-text("Add task")');

  // expect to find text in a span element
  expect(loggedInPage.getByText('create presentation on SaaS')).toBeTruthy();
  expect(loggedInPage.getByText('build SaaS app draft')).toBeTruthy();

  // find a button with text "Generate Schedule" and check it's visible
  const generateScheduleButton = loggedInPage.getByRole('button', { name: 'Generate Schedule' });
  expect(generateScheduleButton).toBeTruthy();

  await Promise.all([
    loggedInPage.waitForRequest((req) => req.url().includes('operations/generate-gpt-response') && req.method() === 'POST'),
    loggedInPage.waitForResponse((response) => {
      // expect the response to be 402 "PAYMENT_REQUIRED"
      if (response.url() === 'http://localhost:3001/operations/generate-gpt-response' && response.status() === 402) {
        return true;
      }
      return false;
    }),
    // We already started waiting before we perform the click that triggers the API calls. So now we just perform the click
    generateScheduleButton.click(),
  ]);
});
