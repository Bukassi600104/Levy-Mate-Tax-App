import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication Configuration
 * Uses AWS Cognito User Pool with Email/Password authentication
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
