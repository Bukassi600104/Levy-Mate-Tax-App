import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { geminiProxy } from './functions/geminiProxy/resource';

/**
 * Backend Entry Point
 * Combines Auth, Data, and Functions into unified backend
 */
const backend = defineBackend({
  auth,
  data,
  geminiProxy,
});

// Add function URL for Gemini proxy (allows direct HTTP access)
const geminiProxyFunction = backend.geminiProxy.resources.lambda;
const fnUrl = geminiProxyFunction.addFunctionUrl({
  authType: 'NONE', // Public access - rate limiting handled by Amplify
  cors: {
    allowedOrigins: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowedMethods: ['POST', 'OPTIONS'],
  },
});

// Export the function URL for use in frontend
backend.addOutput({
  custom: {
    geminiProxyUrl: fnUrl.url,
  },
});
