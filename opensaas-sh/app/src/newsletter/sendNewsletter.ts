import { type SendNewsletter } from 'wasp/server/jobs';

import { type User } from 'wasp/entities';
import { emailSender } from 'wasp/server/email';
import { type Email } from 'wasp/server/email/core/types'; // TODO fix after it gets fixed in wasp :)

const emailToSend: Email = {
  to: '',
  subject: 'The SaaS App Newsletter',
  text: 'Hey There! \n\nThis is just a newsletter that sends automatically via cron jobs',
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
export const checkAndQueueNewsletterEmails: SendNewsletter<never, void> = async (_args, context) => {
  // e.g. you could send an offer email 2 weeks before their subscription expires
  const currentDate = new Date();
  const twoWeeksFromNow = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  const users = (await context.entities.User.findMany({
    where: {
      datePaid: {
        equals: twoWeeksFromNow,
      },
      sendNewsletter: true,
    },
  })) as User[];

  if (users.length === 0) {
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
};
