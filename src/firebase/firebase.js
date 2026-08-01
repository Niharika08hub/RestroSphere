import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCMTY0HXJl0NAynt6qPvj_AWn0GBK0ENJI",
  authDomain: "igdtuw-lost---found.firebaseapp.com",
  projectId: "igdtuw-lost---found",
  storageBucket: "igdtuw-lost---found.firebasestorage.app",
  messagingSenderId: "864924911667",
  appId: "1:864924911667:web:805e5970c1ac22a3b3bb46"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);