import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication Configuration
 * Uses AWS Cognito User Pool with Email/Password authentication
 *
 * User Groups:
 * - admin: Full access to all features, unlimited AI queries
 * - pro: Paid subscribers with Pro features
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['admin', 'pro'],
});
