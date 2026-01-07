import { defineFunction, secret } from '@aws-amplify/backend';

/**
 * Gemini API Proxy Lambda Function
 *
 * This function securely proxies requests to the Google Gemini API,
 * keeping the API key server-side and never exposing it to the client.
 */
export const geminiProxy = defineFunction({
  name: 'geminiProxy',
  entry: './handler.ts',
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY')
  },
  timeoutSeconds: 60,
  memoryMB: 512
});
