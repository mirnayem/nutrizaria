import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyBxd8k-eThZX0qpAUUlQ1Yp5TzE5jXm9q8",
    authDomain: "nutrizaria-27ac1.firebaseapp.com",
    projectId: "nutrizaria-27ac1",
    storageBucket: "nutrizaria-27ac1.firebasestorage.app",
    messagingSenderId: "589188719972",
    appId: "1:589188719972:web:81fb73b34f84ef4e184671",
    measurementId: "G-P37VV5JMNK",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();

  return {
    provide: {
      firebase: {
        app,
        auth,
        db,
        googleProvider,
        signInWithPopup,
        signInWithPhoneNumber,
        RecaptchaVerifier,
      },
    },
  };
});
