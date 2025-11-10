import { EmailSignup } from 'wasp/entities';
import { SubmitEmailSignup, GetEmailSignups } from 'wasp/server/operations';
import { HttpError } from 'wasp/server';

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Submit email signup from landing page
export const submitEmailSignup: SubmitEmailSignup<
  { email: string; source?: string },
  EmailSignup
> = async ({ email, source }, context) => {
  // Validate email
  if (!email || !isValidEmail(email)) {
    throw new HttpError(400, 'Please enter a valid email address');
  }

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if email already exists
    const existingSignup = await context.entities.EmailSignup.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSignup) {
      // Return existing signup (gracefully handle duplicates)
      return existingSignup;
    }

    // Create new email signup
    const newSignup = await context.entities.EmailSignup.create({
      data: {
        email: normalizedEmail,
        source: source || null,
      },
    });

    return newSignup;
  } catch (error: any) {
    console.error('Error creating email signup:', error);
    throw new HttpError(500, 'Failed to save email. Please try again.');
  }
};

// Get all email signups (admin only)
export const getEmailSignups: GetEmailSignups<void, EmailSignup[]> = async (
  _args,
  context
) => {
  // Check if user is admin
  if (!context.user || !context.user.isAdmin) {
    throw new HttpError(403, 'Only admins can view email signups');
  }

  const signups = await context.entities.EmailSignup.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return signups;
};
