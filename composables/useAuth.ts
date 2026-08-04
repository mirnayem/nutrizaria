import { firebaseConfig as defaultFirebaseConfig } from "~/utils/firebaseConfig";
import { useUserStore } from "~/stores/user";

type FirebaseBundle = {
  auth: any;
  phoneProvider: any;
  signInWithPhoneNumber: any;
  RecaptchaVerifier: any;
};

let cachedApp: any = null;

function resolveFirebaseConfig() {
  const config = useRuntimeConfig().public;
  return {
    apiKey: config.firebaseApiKey || defaultFirebaseConfig.apiKey,
    authDomain: config.firebaseAuthDomain || defaultFirebaseConfig.authDomain,
    projectId: config.firebaseProjectId || defaultFirebaseConfig.projectId,
    storageBucket:
      config.firebaseStorageBucket || defaultFirebaseConfig.storageBucket,
    messagingSenderId:
      config.firebaseMessagingSenderId || defaultFirebaseConfig.messagingSenderId,
    appId: config.firebaseAppId || defaultFirebaseConfig.appId,
    measurementId:
      config.firebaseMeasurementId || defaultFirebaseConfig.measurementId,
  };
}

async function loadFirebaseAuth(): Promise<FirebaseBundle> {
  const [{ initializeApp }, auth] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);

  const app = cachedApp ?? initializeApp(resolveFirebaseConfig());
  cachedApp = app;

  return {
    auth: auth.getAuth(app),
    phoneProvider: auth.RecaptchaVerifier,
    signInWithPhoneNumber: auth.signInWithPhoneNumber,
    RecaptchaVerifier: auth.RecaptchaVerifier,
  };
}

const loadGsi = () =>
  new Promise<void>((resolve, reject) => {
    const w = window as any;
    if (w.google?.accounts?.oauth2) return resolve();
    if (w.__gsiLoaded) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      w.__gsiLoaded = true;
      resolve();
    };
    s.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });

export function useAuth() {
  const config = useRuntimeConfig().public;
  const clientId = config.googleClientId as string;
  const userStore = useUserStore();

  // Google Login (Google Identity Services, client ID based)
  const loginWithGoogle = async (): Promise<boolean> => {
    if (!clientId) {
      throw new Error(
        "Google sign-in is not configured. Set NUXT_PUBLIC_GOOGLE_CLIENT_ID."
      );
    }

    await loadGsi();

    const accessToken: string | null = await new Promise((resolve) => {
      const w = window as any;
      const client = w.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (response: any) => {
          if (response?.error) {
            resolve(null);
            return;
          }
          resolve(response?.access_token || null);
        },
      });
      client.requestAccessToken({ prompt: "select_account" });
    });

    if (!accessToken) return false;

    // Cache identity locally so a backend outage can still sign in
    try {
      const info = await $fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (info?.email) {
        localStorage.setItem(
          "googleUser",
          JSON.stringify({
            googleId: info.sub,
            email: info.email,
            name: info.name || null,
            photoURL: info.picture || null,
          })
        );
      }
    } catch {
      /* identity fetch is best-effort */
    }

    const ok = await userStore.googleLogin(accessToken);
    if (!ok) {
      throw new Error("Google sign-in failed");
    }
    return true;
  };

  // Phone Login (Step 1: Send OTP)
  const sendOTP = async (phoneNumber: string, captchaContainerId: string) => {
    const f = await loadFirebaseAuth();
    const appVerifier = new f.RecaptchaVerifier(
      captchaContainerId,
      { size: "invisible" },
      f.auth
    );
    return await f.signInWithPhoneNumber(f.auth, phoneNumber, appVerifier);
  };

  return { loginWithGoogle, sendOTP };
}