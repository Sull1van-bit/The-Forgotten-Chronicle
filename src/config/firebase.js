import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDD5kdudhbTbC3tubv8YoKZuRab7BRshoU",
    authDomain: "the-forgotten-chronicle.firebaseapp.com",
    projectId: "the-forgotten-chronicle",
    storageBucket: "the-forgotten-chronicle.firebasestorage.app",
    messagingSenderId: "632825706657",
    appId: "1:632825706657:web:c9788d399d7b53a62d98e0",
    measurementId: "G-8527CY3XXR"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 