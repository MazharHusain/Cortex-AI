import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-95209.firebaseapp.com",
  projectId: "cortexai-95209",
  storageBucket: "cortexai-95209.firebasestorage.app",
  messagingSenderId: "582341352058",
  appId: "1:582341352058:web:d4bfbcad1d071f19bcf9c3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
