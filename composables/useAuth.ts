import { firebaseConfig } from "~/utils/firebaseConfig";

type FirebaseBundle = {
  auth: any;
  db: any;
  GoogleAuthProvider: any;
  signInWithPopup: any;
  signInWithPhoneNumber: any;
  RecaptchaVerifier: any;
  doc: any;
  setDoc: any;
};

let cachedApp: any = null;

async function loadFirebase(): Promise<FirebaseBundle> {
  const [{ initializeApp }, auth, firestore] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]);

  const app = cachedApp ?? initializeApp(firebaseConfig);
  cachedApp = app;

  return {
    auth: auth.getAuth(app),
    db: firestore.getFirestore(app),
    GoogleAuthProvider: auth.GoogleAuthProvider,
    signInWithPopup: auth.signInWithPopup,
    signInWithPhoneNumber: auth.signInWithPhoneNumber,
    RecaptchaVerifier: auth.RecaptchaVerifier,
    doc: firestore.doc,
    setDoc: firestore.setDoc,
  };
}

export function useAuth() {
  // Google Login
  const loginWithGoogle = async () => {
    const f = await loadFirebase();
    const provider = new f.GoogleAuthProvider();
    const result = await f.signInWithPopup(f.auth, provider);
    await saveUser(result.user);
    return result.user;
  };

  // Phone Login (Step 1: Send OTP)
  const sendOTP = async (phoneNumber: string, captchaContainerId: string) => {
    const f = await loadFirebase();
    const appVerifier = new f.RecaptchaVerifier(
      captchaContainerId,
      { size: "invisible" },
      f.auth
    );
    return await f.signInWithPhoneNumber(f.auth, phoneNumber, appVerifier);
  };

  // Save user to Firestore
  const saveUser = async (user: any) => {
    if (!user) return;
    const f = await loadFirebase();
    const userRef = f.doc(f.db, "users", user.uid);
    await f.setDoc(
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
