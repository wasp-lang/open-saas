import { defineAdditionalSignupFields } from '@wasp/auth/index.js'

export default defineAdditionalSignupFields({
  isAdmin: (data) => {
    if (!data.email) {
      return false;
    } 
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    return adminEmails.includes(data.email as string);
  },
});