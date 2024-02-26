import { defineUserSignupFields as defineAdditionalSignupFields } from 'wasp/server/auth';

export default defineAdditionalSignupFields({
  email: (data: any) => {
    return data.email as string;
  },
  username: (data: any) => {
    return data.email as string;
  },
});
