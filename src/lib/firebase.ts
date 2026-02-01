import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: 'https://loom-f82d6-default-rtdb.europe-west1.firebasedatabase.app',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseEnabled = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | undefined;

export const getFirebaseApp = () => {
  if (!isFirebaseEnabled) {
    throw new Error('Firebase non configurato: aggiungi le variabili VITE_FIREBASE_* nel .env.local');
  }
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirebaseFirestore = () => getFirestore(getFirebaseApp());
export const getFirebaseDatabase = () => getDatabase(getFirebaseApp());
