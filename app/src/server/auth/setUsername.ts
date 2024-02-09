import { defineUserSignupFields as defineAdditionalSignupFields } from 'wasp/auth/providers/types';

export default defineAdditionalSignupFields({
  username: (data) => {
    return data.email as string;
  },
});
