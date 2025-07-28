
import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use firebaseConfig.json for correct project credentials
import localConfig from '../../firebaseConfig.json';
const firebaseConfig = localConfig;

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

const getFirebaseAuth = () => getAuth(app);
const getFirebaseFirestore = (): Firestore => db;
const getFirebaseStorage = () => getStorage(app);

export { app, getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage, db, storage };
