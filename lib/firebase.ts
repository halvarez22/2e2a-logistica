import {
  initializeApp,
  getApps,
  type FirebaseOptions,
  type FirebaseApp,
} from "firebase/app";
 import { getAuth } from "firebase/auth";
 import { getFirestore } from "firebase/firestore";
 
const cfg: FirebaseOptions = {
   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
 };
 
let app: FirebaseApp | undefined = getApps().length ? getApps()[0] : undefined;
if (!app && cfg.apiKey && cfg.projectId && cfg.appId) {
  app = initializeApp(cfg);
}
 
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
