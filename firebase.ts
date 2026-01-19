// FIX: Use namespace imports for firebase modules to resolve export errors.
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import * as firebaseAnalytics from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const app = firebaseApp.initializeApp(firebaseConfig);

// Export the necessary Firebase services for your app to use
export const db = getFirestore(app);
export const auth = firebaseAuth.getAuth(app);
export const storage = getStorage(app);
export const analytics = firebaseAnalytics.getAnalytics(app);