// All imports at the top
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSCvW-1CnRNo2s0t0N4owX7AZiQbD5UMU",
  authDomain: "saathi-helpline-4be72.firebaseapp.com",
  projectId: "saathi-helpline-4be72",
  storageBucket: "saathi-helpline-4be72.firebasestorage.app",
  messagingSenderId: "398805540974",
  appId: "1:398805540974:web:6342ad3ac2c6c31c37067f",
  measurementId: "G-SHMVGW7QE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Export them
export { db, auth, provider };
