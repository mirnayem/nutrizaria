import { doc, setDoc } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { GoogleAuthProvider } from "firebase/auth";
import {
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";

export function useAuth() {
  const { $firebase } = useNuxtApp() as {
    $firebase: {
      auth: Auth;
      db: Firestore;
      googleProvider: GoogleAuthProvider;
      signInWithPopup: typeof signInWithPopup;
      signInWithPhoneNumber: typeof signInWithPhoneNumber;
      RecaptchaVerifier: typeof RecaptchaVerifier;
    };
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      const result = await $firebase.signInWithPopup(
        $firebase.auth,
        $firebase.googleProvider
      );
      await saveUser(result.user);
      return result.user;
    } catch (err) {
      console.error("Google Login Error:", err);
      throw err;
    }
  };

  // Phone Login (Step 1: Send OTP)
  const sendOTP = async (phoneNumber: string, captchaContainerId: string) => {
    const appVerifier = new $firebase.RecaptchaVerifier(
      captchaContainerId,
      { size: "invisible" },
      $firebase.auth
    );
    return await $firebase.signInWithPhoneNumber(
      $firebase.auth,
      phoneNumber,
      appVerifier
    );
  };

  // Save user to Firestore
  const saveUser = async (user: any) => {
    if (!user) return;
    const userRef = doc($firebase.db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || null,
        phoneNumber: user.phoneNumber || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        lastLogin: new Date(),
      },
      { merge: true }
    );
  };

  return { loginWithGoogle, sendOTP, saveUser };
}
