import admin from "firebase-admin";
import logger from "./logger.ts";

if (!admin.apps.length) {
  try {
    const storageBucket = 'dndiscord-d88c9.firebasestorage.app';
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket,
    });
    logger.info({ storageBucket }, "✅ Firebase initialized (ADC)");
  } catch (e) {
    logger.error({ err: e, stack: (e as Error).stack }, 'Firebase admin initialization error');
  }
}

export const storage = admin.storage();
export const firestore = admin.firestore();
export const auth = admin.auth();

