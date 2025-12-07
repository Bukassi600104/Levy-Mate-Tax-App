import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Backend Entry Point
 * Combines Auth and Data resources into unified backend
 */
defineBackend({
  auth,
  data,
});
