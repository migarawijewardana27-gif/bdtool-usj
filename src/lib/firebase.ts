import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtZMf0tAedJqLFmHgGXOFLF_1wTyr9NXk",
  authDomain: "bdtool-usj.firebaseapp.com",
  projectId: "bdtool-usj",
  storageBucket: "bdtool-usj.firebasestorage.app",
  messagingSenderId: "466080549044",
  appId: "1:466080549044:web:5ecd37f9d1a140fa05efe1",
  measurementId: "G-LSVD6247FH",
};

// Prevent re-initialization in dev mode (hot reload)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
