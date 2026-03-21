import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfzbC2L9TQcbXbDZltPL44u-NCp-heQNI",
  authDomain: "digital-talent-management.firebaseapp.com",
  projectId: "digital-talent-management",
  storageBucket: "digital-talent-management.firebasestorage.app",
  messagingSenderId: "888409768292",
  appId: "1:888409768292:web:b5b4700ff15a2361a57a71",
  measurementId: "G-CBHMLDGBZB"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// Always show the account picker so user can choose which Google account
provider.setCustomParameters({ prompt: "select_account" });

export { auth, provider, signInWithPopup };