import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhPO7KZvX8y8Whnyg9jGxT66_PDzunabU",
  authDomain: "bdtool-aiesecsl.firebaseapp.com",
  projectId: "bdtool-aiesecsl",
  storageBucket: "bdtool-aiesecsl.firebasestorage.app",
  messagingSenderId: "185199679929",
  appId: "1:185199679929:web:0f9859a84f082e6433fe68",
  measurementId: "G-MHLCWM6H88",
};

// Prevent re-initialization in dev mode (hot reload)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
