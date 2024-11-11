// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnfByT5N7chJztsaognnkSGnJc0guJjo0",
  authDomain: "web-app-music.firebaseapp.com",
  projectId: "web-app-music",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "719559863784",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
