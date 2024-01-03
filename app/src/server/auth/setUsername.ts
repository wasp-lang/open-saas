import { defineAdditionalSignupFields } from '@wasp/auth/index.js';

export default defineAdditionalSignupFields({
  username: (data) => {
    return data.email as string;
  },
});
