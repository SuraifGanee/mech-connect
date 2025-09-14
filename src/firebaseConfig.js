// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBtDJ0_jh3nzk9Cv9C1HVq4KOB1_5FlQkg",
  authDomain: "mechconnect-system.firebaseapp.com",
  databaseURL: "https://mechconnect-system-default-rtdb.firebaseio.com",
  projectId: "mechconnect-system",
  storageBucket: "mechconnect-system.firebasestorage.app",
  messagingSenderId: "681592066673",
  appId: "1:681592066673:web:33c744522ac5b8e53581d0",
  measurementId: "G-KH97XS7QWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export db (No need to export analytics if you are not using it)
export { db };
