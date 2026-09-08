import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGX6WY3EON7KxTOEaGUw2RilnwnC2U9f4",
  authDomain: "bungo-16434.firebaseapp.com",
  projectId: "bungo-16434",
  storageBucket: "bungo-16434.firebasestorage.app",
  messagingSenderId: "443547374078",
  appId: "1:443547374078:web:f0f397f28aaffa01f730af",
  measurementId: "G-HEVTFYY1DF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (it can fail in some environments like adblockers)
export let analytics: any;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics could not be initialized", e);
}

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn("Firebase persistence: Multiple tabs open, persistence disabled in this tab.");
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn("Firebase persistence: Browser doesn't support persistence.");
  }
});
