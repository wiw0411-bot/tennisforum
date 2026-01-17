// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyClUp_tD4HQ6AlZDCRy4nEWlKX1UBwjjLc",
  authDomain: "tennis-forum-app.firebaseapp.com",
  projectId: "tennis-forum-app",
  storageBucket: "tennis-forum-app.firebasestorage.app",
  messagingSenderId: "134633652142",
  appId: "1:134633652142:web:393ec75a0bb3638c51523f",
  measurementId: "G-BW11KF2BLQ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the necessary Firebase services for your app to use
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
