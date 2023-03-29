import { emailSender } from '@wasp/jobs/emailSender.js';
import type { Email } from './sendGrid';
import type { Context } from '../types';

const emailToSend: Email = {
  to: '',
  subject: 'The SaaS App Newsletter',
  text: "Hey There! \n\nThis is just a newsletter that sends automatically via cron jobs",
  html: `<html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>SaaS App Newsletter</title>
          </head>
          <body>
            <p>Hey There!</p>
            
            <p>This is just a newsletter that sends automatically via cron jobs</p>
          </body>
        </html>`,
};

export async function checkAndQueueEmails(_args: unknown, context: Context) {
  const currentDate = new Date();
  const twoWeeksFromNow = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  console.log('Starting CRON JOB: \n\nSending expiration notices...');

  const users = await context.entities.User.findMany({
    where: {
      datePaid: {
        equals: twoWeeksFromNow,
      },
      sendEmail: true,
    },
  });

  console.log('Sending expiration notices to users: ', users.length);

  if (users.length === 0) {
    console.log('No users to send expiration notices to.');
    return;
  }
  await Promise.allSettled(
    users.map(async (user) => {
      if (user.email) {
        try {
          emailToSend.to = user.email;
          await emailSender.submit(emailToSend);
        } catch (error) {
          console.error('Error sending expiration notice to user: ', user.id, error);
        }
      }
    })
  );
}
