import { expect } from '@playwright/test';
import { createLoggedInUserFixture } from './utils';

// Create a new test fixture with a paid user and a logged in page
const test = createLoggedInUserFixture({ hasPaid: true, credits: 10 });

// test /demo-app page by entering "todo" and clicking add task
test('Demo App: add tasks & generate schedule', async ({ loggedInPage }) => {
  const task1 = 'create presentation on SaaS';
  const task2 = 'build SaaS app draft';

  await loggedInPage.waitForURL('/demo-app');

  // Fill input id="description" with "create presentation"
  await loggedInPage.fill('input[id="description"]', task1);

  // Click button:has-text("Add task")
  await loggedInPage.click('button:has-text("Add task")');

  await loggedInPage.fill('input[id="description"]', task2);

  await loggedInPage.click('button:has-text("Add task")');

  // expect to find text in a span element
  expect(loggedInPage.getByText(task1)).toBeTruthy();
  expect(loggedInPage.getByText(task2)).toBeTruthy();

  // find a button with text "Generate Schedule" and check it's visible
  const generateScheduleButton = loggedInPage.getByRole('button', { name: 'Generate Schedule' });
  expect(generateScheduleButton).toBeTruthy();

  await Promise.all([
    loggedInPage.waitForRequest(
      (req) => req.url().includes('operations/generate-gpt-response') && req.method() === 'POST'
    ),
    loggedInPage.waitForResponse((response) => {
      if (response.url().includes('/operations/generate-gpt-response') && response.status() === 200) {
        return true;
      }
      return false;
    }),
    // We already started waiting before we perform the click that triggers the API calls. So now we just perform the click
    generateScheduleButton.click(),
  ]);

  const table = loggedInPage.getByRole('table');
  await expect(table).toBeVisible();
  const tableTextContent = (await table.innerText()).toLowerCase();
  console.log(tableTextContent)

  expect(tableTextContent.includes(task1.toLowerCase())).toBeTruthy();
  expect(tableTextContent.includes(task2.toLowerCase())).toBeTruthy();
});
