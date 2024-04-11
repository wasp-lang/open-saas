import { expect } from '@playwright/test';
import { createLoggedInUserFixture } from './utils';

const test = createLoggedInUserFixture();

test('make test payment with stripe', async ({ loggedInPage, testUser }) => {
  console.log('running stripe payment');
  test.slow();
  await loggedInPage.click('text="Pricing"');
  await loggedInPage.waitForURL('**/pricing');

  // find the Buy plan button
  const buyBtn = await loggedInPage.waitForSelector('button:has-text("Buy plan")', { state: 'visible' });
  await buyBtn.isEnabled();
  await buyBtn.click();

  await loggedInPage.waitForURL('https://checkout.stripe.com/**', { waitUntil: 'domcontentloaded' });

  await loggedInPage.fill('input[name="cardNumber"]', '4242424242424242');
  await loggedInPage.getByPlaceholder('MM / YY').fill('1225');
  await loggedInPage.getByPlaceholder('CVC').fill('123');
  await loggedInPage.getByPlaceholder('Full name on card').fill('Test User');
  const countrySelect = loggedInPage.getByLabel('Country or region');
  await countrySelect.selectOption('Germany');

  await loggedInPage.waitForResponse(
    (response) => response.url().includes('trusted-types-checker') && response.status() === 200
  );
  const payBtn = await loggedInPage.waitForSelector('button[data-testid="hosted-payment-submit-button"]');

  await payBtn.click();

  // wait for payment to processs

  await loggedInPage.waitForURL('**/checkout?success=true');

  await loggedInPage.waitForURL('**/account');

  await expect(loggedInPage.getByText('Hobby Plan')).toBeVisible();
});

test('Demo App: add tasks & generate schedule', async ({ loggedInPage, testUser }) => {
  const task1 = 'create presentation on SaaS';
  const task2 = 'build SaaS app draft';

  await loggedInPage.waitForURL('**/demo-app');

  await loggedInPage.fill('input[id="description"]', task1);

  await loggedInPage.click('button:has-text("Add task")');

  await expect(loggedInPage.getByText(task1)).toBeVisible();

  await loggedInPage.fill('input[id="description"]', task2);

  await loggedInPage.click('button:has-text("Add task")');

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
