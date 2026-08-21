/**
 * Firebase Client Configuration & Authentication Helpers
 *
 * Configured using REACT_APP_FIREBASE_* environment variables.
 * Falls back to demo config if environment variables are not yet provided.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDemoKeyForCTMSAppPlacement12345',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'ctms-demo-app.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'ctms-demo-app',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'ctms-demo-app.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:1234567890:web:abcdef1234567890',
};

// Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google Popup
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      idToken,
      name: result.user.displayName,
      email: result.user.email,
      uid: result.user.uid,
    };
  } catch (error) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
};

/**
 * Sign in with Email and Password via Firebase
 */
export const signInWithEmailFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return {
      user: userCredential.user,
      idToken,
      name: userCredential.user.displayName || email.split('@')[0],
      email: userCredential.user.email,
      uid: userCredential.user.uid,
    };
  } catch (error) {
    console.error('Firebase Email Sign-In error:', error);
    throw error;
  }
};

/**
 * Register with Email, Password and Display Name via Firebase
 */
export const signUpWithEmailFirebase = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    const idToken = await userCredential.user.getIdToken();
    return {
      user: userCredential.user,
      idToken,
      name: displayName || userCredential.user.displayName || email.split('@')[0],
      email: userCredential.user.email,
      uid: userCredential.user.uid,
    };
  } catch (error) {
    console.error('Firebase Sign-Up error:', error);
    throw error;
  }
};

export const signOutFirebase = () => signOut(auth);

export default app;
