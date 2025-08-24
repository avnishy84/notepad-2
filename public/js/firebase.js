// Firebase SDK imports (modular v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB25gCbsB330Z3ACjOmKNLDjUzU4ZXvwwY",
  authDomain: "notepad-2-e34b1.firebaseapp.com",
  projectId: "notepad-2-e34b1",
  storageBucket: "notepad-2-e34b1.firebasestorage.app",
  messagingSenderId: "454576192778",
  appId: "1:454576192778:web:d087965f804ec594914ef3",
  measurementId: "G-Y1XR5RDXR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized");

// Export for use in app.js
export { app, analytics, auth, db };
