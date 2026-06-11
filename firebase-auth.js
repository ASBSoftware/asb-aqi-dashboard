import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
window.allowedUsers = [

   "shettyd@asbindia.org",
    "fisherym@asbindia.org",
    "security@asbindia.org",
    "murukatec@asbindia.org",
    "mores@asbindia.org",
    "sandbhorp@asbindia.org",
    "software@asbindia.org",
    "shindea@asbindia.org"

];
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
}


from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBm_1vafDiRkCJ0RVZj6qhePa8jPSMDVBA",
  authDomain: "asbaqidashboard.firebaseapp.com",
  projectId: "asbaqidashboard",
  storageBucket: "asbaqidashboard.firebasestorage.app",
  messagingSenderId: "620753232704",
  appId: "1:620753232704:web:4e45327a52c66a0b9550a5",
  measurementId: "G-M5KREWX0VE"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

window.asbAuth = auth;
window.asbProvider = provider;
window.signInWithPopup = signInWithPopup;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;