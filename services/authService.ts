import { signUp, signIn, signOut, getCurrentUser, confirmSignUp, fetchUserAttributes, resendSignUpCode, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
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

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
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
 * Resend sign-up confirmation code
 */
export const authResendSignUpCode = async (email: string): Promise<void> => {
  try {
    await resendSignUpCode({
      username: email
    });
  } catch (error) {
    console.error('Resend code error:', error);
    throw error;
  }
};

/**
 * Initiate password reset (Forgot Password)
 */
export const authForgotPassword = async (email: string): Promise<{ nextStep: any }> => {
  try {
    const output = await resetPassword({ username: email });
    return { nextStep: output.nextStep };
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Confirm password reset with code and new password
 */
export const authConfirmResetPassword = async (input: ResetPasswordInput): Promise<void> => {
  try {
    await confirmResetPassword({
      username: input.email,
      confirmationCode: input.code,
      newPassword: input.newPassword
    });
  } catch (error) {
    console.error('Confirm reset password error:', error);
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
    // Optimization: Don't fetch attributes here to speed up auth checks.
    // If email is needed, use authGetUserAttributes() or check user.signInDetails
    return {
      userId: user.userId,
      email: user.signInDetails?.loginId,
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

/**
 * Delete the current user
 */
export const authDeleteUser = async (): Promise<void> => {
  try {
    const { deleteUser } = await import('aws-amplify/auth');
    await deleteUser();
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Request a verification code for account deletion (Mock)
 * In a real app, this would trigger a Lambda to send an email
 */
export const authRequestDeleteCode = async (): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real scenario, this code is sent to email. 
    // For this demo, we'll return it or log it.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Mock Delete Code:', code);
    return code;
};
