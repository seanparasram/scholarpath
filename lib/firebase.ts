import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD0ZSuNc3rsOQ9t0m5IqL_bP3j78B4n1Cg",
  authDomain: "scholarshiproute-669e9.firebaseapp.com",
  projectId: "scholarshiproute-669e9",
  storageBucket: "scholarshiproute-669e9.firebasestorage.app",
  messagingSenderId: "712440352916",
  appId: "1:712440352916:web:c9c3d41f58baafa680a481",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
