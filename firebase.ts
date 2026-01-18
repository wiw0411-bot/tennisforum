// FIX: The project seems to be using Firebase v8 SDK.
// The imports and initialization logic are updated to v8 compatibility syntax.
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/firestore";
import "firebase/storage";

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
const app = firebase.initializeApp(firebaseConfig);

// Export the necessary Firebase services for your app to use
export const db = app.firestore();
export const auth = app.auth();
export const storage = app.storage();
export const analytics = app.analytics();