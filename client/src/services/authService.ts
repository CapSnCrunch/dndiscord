import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    uid: string;
    email: string;
  };
  token: string;
}

/*
  AuthService is responsible for handling all authentication logic
  including registering, logging in, and logging out.
  Note: This service only handles authentication, not database/storage access.
*/
export const authService = {
  // Register a new user with email and password
  async register(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const token = await userCredential.user.getIdToken();

      return {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
        },
        token,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login a user with email and password
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const token = await userCredential.user.getIdToken();

      return {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
        },
        token,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Sign out a user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  },

  // Send password reset email
  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Get ID token for current user
  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },
};

