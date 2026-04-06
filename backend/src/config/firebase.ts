import admin, { ServiceAccount } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env";

const initializeFirebase = (): admin.app.App => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    const credential = admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    } as ServiceAccount);

    return admin.initializeApp({ credential, projectId: env.FIREBASE_PROJECT_ID });
  }

  return admin.initializeApp();
};

const app = initializeFirebase();
export const adminAuth = app.auth();
const db = env.FIREBASE_DATABASE_ID
  ? getFirestore(app, env.FIREBASE_DATABASE_ID)
  : getFirestore(app);

db.settings({ ignoreUndefinedProperties: true });

export const firestoreDb = db;
