// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-analytics.js";

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

console.log("Firebase initialized");

export { app, analytics };
