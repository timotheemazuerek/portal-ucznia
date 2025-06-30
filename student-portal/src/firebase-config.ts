// Import Firebase apps previously initialized in an SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Using the same details from the original js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyBvegeEvSxBlx-1UUhD_PIywpjW3TlL8So",
    authDomain: "subos-1-0-beta-10-pre-release.firebaseapp.com",
    projectId: "subos-1-0-beta-10-pre-release",
    storageBucket: "subos-1-0-beta-10-pre-release.appspot.com",
    messagingSenderId: "914402204178",
    appId: "1:914402204178:web:84e7accc42e5e1711096cb",
    measurementId: "G-B06SXV7MKR"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the services for use in other parts of the application
export { app, auth, db, storage };
