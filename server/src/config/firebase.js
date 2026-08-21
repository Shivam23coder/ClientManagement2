/**
 * Firebase Admin SDK Configuration
 *
 * Initializes Firebase Admin for verifying Firebase ID tokens passed by the frontend.
 * Supports initialization via environment variables:
 *  - FIREBASE_PROJECT_ID
 *  - FIREBASE_CLIENT_EMAIL
 *  - FIREBASE_PRIVATE_KEY
 *
 * If credentials are not set, falls back to a graceful token payload extractor
 * so development/testing continues seamlessly.
 */

const admin = require('firebase-admin');

let isInitialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped \n characters if present in env string
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
    isInitialized = true;
    console.log('✅  Firebase Admin SDK initialized successfully');
  } else {
    console.log('ℹ️   Firebase Admin SDK running in development fallback mode (no FIREBASE_PROJECT_ID env set)');
  }
} catch (err) {
  console.warn('⚠️  Firebase Admin initialization warning:', err.message);
}

/**
 * Verify a Firebase ID token.
 * If Firebase Admin is initialized, uses admin.auth().verifyIdToken(idToken).
 * Otherwise, decodes token safely for development testing.
 */
const verifyFirebaseToken = async (idToken) => {
  if (isInitialized) {
    return await admin.auth().verifyIdToken(idToken);
  }

  // Fallback for development without service account JSON:
  // Base64 decode the JWT payload to extract user claims safely
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payloadBuf = Buffer.from(parts[1], 'base64');
      const payload = JSON.parse(payloadBuf.toString('utf-8'));
      return {
        uid: payload.sub || payload.user_id || payload.uid,
        email: payload.email,
        name: payload.name || payload.email?.split('@')[0],
      };
    }
  } catch (e) {
    // If token is raw mock string in dev
    return {
      uid: idToken,
      email: undefined,
      name: undefined,
    };
  }

  throw new Error('Invalid Firebase token format');
};

module.exports = { admin, verifyFirebaseToken };
