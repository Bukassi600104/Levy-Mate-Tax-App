import { signUp, signIn, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

/**
 * Auth Service Layer
 * Wraps Amplify Auth (Cognito) operations with error handling and type safety
 */

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface CurrentUser {
  userId: string;
  email?: string;
  username?: string;
}

/**
 * Sign up a new user with email and password
 */
export const authSignUp = async (input: SignUpInput): Promise<{ userId: string; nextStep: any }> => {
  try {
    const result = await signUp({
      username: input.email,
      password: input.password,
      options: {
        userAttributes: {
          email: input.email,
          name: input.name,
        },
      },
    });
    return {
      userId: result.userId,
      nextStep: result.nextStep,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Confirm sign-up (email verification)
 */
export const authConfirmSignUp = async (email: string, code: string): Promise<void> => {
  try {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  } catch (error) {
    console.error('Confirm sign up error:', error);
    throw error;
  }
};

/**
 * Sign in user with email and password
 */
export const authSignIn = async (input: SignInInput): Promise<{ isSignedIn: boolean }> => {
  try {
    const result = await signIn({
      username: input.email,
      password: input.password,
    });
    return {
      isSignedIn: result.isSignedIn,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const authGetCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const user = await getCurrentUser();
    return {
      userId: user.userId,
      email: user.userAttributes?.email,
      username: user.username,
    };
  } catch (error) {
    // No user signed in - this is expected
    console.debug('No current user');
    return null;
  }
};

/**
 * Sign out the current user
 */
export const authSignOut = async (): Promise<void> => {
  try {
    await signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const authIsAuthenticated = async (): Promise<boolean> => {
  const user = await authGetCurrentUser();
  return user !== null;
};
