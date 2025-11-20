import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication Configuration
 * Uses Email/Password for sign-up.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
