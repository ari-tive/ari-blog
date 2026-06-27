import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "aritive-blog.firebaseapp.com",
  projectId: "aritive-blog",
  storageBucket: "aritive-blog.firebasestorage.app",
  messagingSenderId: "239316491523",
  appId: "1:239316491523:web:13fcdf3c28713f55009d36",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
