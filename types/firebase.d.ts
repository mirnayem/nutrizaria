import { FirebaseApp } from "firebase/app";
import {
  Auth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Firestore } from "firebase/firestore";

declare module "#app" {
  interface NuxtApp {
    $firebase: {
      app: FirebaseApp;
      auth: Auth;
      db: Firestore;
      googleProvider: GoogleAuthProvider;
      signInWithPopup: typeof signInWithPopup;
      signInWithPhoneNumber: typeof signInWithPhoneNumber;
      RecaptchaVerifier: typeof RecaptchaVerifier;
    };
  }
}

export {};
