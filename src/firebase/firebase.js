
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsVAy6wPEzytPPqqY8U0qxLmIMnzk157I",
  authDomain: "studentattendancesystem-9ca57.firebaseapp.com",
  projectId: "studentattendancesystem-9ca57",
  storageBucket: "studentattendancesystem-9ca57.firebasestorage.app",
  messagingSenderId: "875390296417",
  appId: "1:875390296417:web:282eeab6a6533c645e6520",
  measurementId: "G-C8FVND80SW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // For Authentication
export const db = getFirestore(app); // For Firestore Database