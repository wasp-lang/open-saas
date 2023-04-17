import { emailSender } from '@wasp/email/index.js'

import type { Email } from '@wasp/email/core/types';
import type { User } from '@wasp/entities'
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

//  you could use this function to send newsletters, expiration notices, etc.
export async function checkAndQueueEmails(_args: unknown, context: Context) {

  // e.g. you could send an offer email 2 weeks before their subscription expires
  const currentDate = new Date();
  const twoWeeksFromNow = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  console.log('Starting CRON JOB: \n\nSending notices...');

  const users = await context.entities.User.findMany({
    where: {
      datePaid: {
        equals: twoWeeksFromNow,
      },
      sendEmail: true,
    },
  }) as User[];

  console.log('Sending notices to users: ', users.length);

  if (users.length === 0) {
    console.log('No users to send notices to.');
    return;
  }
  await Promise.allSettled(
    users.map(async (user) => {
      if (user.email) {
        try {
          emailToSend.to = user.email;
          await emailSender.send(emailToSend);
        } catch (error) {
          console.error('Error sending notice to user: ', user.id, error);
        }
      }
    })
  );
}
