import { expect } from '@playwright/test';
import { createLoggedInUserFixture } from './utils';

const test = createLoggedInUserFixture();

test('Demo app: cannot generate schedule', async ({ loggedInPage, testUser }) => {
  const task1 = 'create presentation on SaaS';
  const task2 = 'build SaaS app draft';

  await loggedInPage.fill('input[id="description"]', task1);

  await loggedInPage.click('button:has-text("Add task")');

  await expect(loggedInPage.getByText(task1)).toBeVisible();

  await loggedInPage.fill('input[id="description"]', task2);

  await loggedInPage.click('button:has-text("Add task")');

  expect(loggedInPage.getByText(task2)).toBeTruthy();

  // Each user is given 3 credits for free on signup. This will allow them to call the OpenAI API 3 times.
  // After that, if they haven't paid, they will not be able to generate a schedule.
  // In this test, we use up the first 3 credits, so that the 4th one should fail.
  for (let i = 0; i < 4; i++) {
    if (i === 3) {
      await loggedInPage.reload();
    }

    const generateScheduleButton = loggedInPage.getByRole('button', { name: 'Generate Schedule' });
    await expect(generateScheduleButton).toBeVisible();

    await Promise.all([
      loggedInPage.waitForRequest(
        (req) => req.url().includes('operations/generate-gpt-response') && req.method() === 'POST'
      ),

      loggedInPage.waitForResponse((response) => {
        if (i === 3) {
          // expect the response to be 402 "PAYMENT_REQUIRED"
          return response.url().includes('/operations/generate-gpt-response') && response.status() === 402;
        } else {
          return response.url().includes('/operations/generate-gpt-response') && response.status() === 200;
        }
      }),
      // We already started waiting before we perform the click that triggers the API calls. So now we just perform the click
      generateScheduleButton.click(),
    ]);

    // we already show a table with some dummy data even before the API call
    const table = loggedInPage.getByRole('table');
    await expect(table).toBeVisible();
    const tableTextContent = (await table.innerText()).toLowerCase();

    if (i !== 3) {
      expect(tableTextContent.includes(task1.toLowerCase())).toBeTruthy();
      expect(tableTextContent.includes(task2.toLowerCase())).toBeTruthy();
    } else {
      // reload page
      
      expect(tableTextContent.includes(task1.toLowerCase())).toBeFalsy();
      expect(tableTextContent.includes(task2.toLowerCase())).toBeFalsy();
    }
  }
});
