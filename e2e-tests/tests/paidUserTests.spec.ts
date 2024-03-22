import { expect } from '@playwright/test';
import { createLoggedInUserFixture } from './utils';

const test = createLoggedInUserFixture({ hasPaid: true, credits: 10 });

test('Demo App: add tasks & generate schedule', async ({ loggedInPage }) => {
  const task1 = 'create presentation on SaaS';
  const task2 = 'build SaaS app draft';

  await loggedInPage.waitForURL('/demo-app');

  await loggedInPage.fill('input[id="description"]', task1);

  await loggedInPage.click('button:has-text("Add task")');

  await loggedInPage.fill('input[id="description"]', task2);

  await loggedInPage.click('button:has-text("Add task")');

  await expect(loggedInPage.getByText(task1)).toBeVisible();
  await expect(loggedInPage.getByText(task2)).toBeVisible();

  const generateScheduleButton = loggedInPage.getByRole('button', { name: 'Generate Schedule' });
  await expect(generateScheduleButton).toBeVisible();

  await Promise.all([
    loggedInPage
      .waitForRequest((req) => req.url().includes('operations/generate-gpt-response') && req.method() === 'POST')
      .catch((err) => console.error(err.message)),
    loggedInPage
      .waitForResponse((response) => {
        if (response.url().includes('/operations/generate-gpt-response') && response.status() === 200) {
          return true;
        }
        return false;
      })
      .catch((err) => console.error(err.message)),
    // We already started waiting before we perform the click that triggers the API calls. So now we just perform the click
    generateScheduleButton.click(),
  ]);

  await loggedInPage.waitForSelector('table');
  const table = loggedInPage.getByRole('table');
  await expect(table).toBeVisible();
  const tableTextContent = (await table.innerText()).toLowerCase();
  console.log('table text content >> :', tableTextContent);
  expect(tableTextContent.includes(task1.toLowerCase())).toBeTruthy();
  expect(tableTextContent.includes(task2.toLowerCase())).toBeTruthy();
});
