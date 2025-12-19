<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 text-slate-50">
    <div class="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur">
      <div class="grid gap-10 rounded-[26px] bg-white/90 p-10 text-slate-800 lg:grid-cols-[1.1fr,0.9fr]">
        <section class="space-y-6">
          <p class="inline-flex items-center gap-2 rounded-full border border-violet-200/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
            Secure access
          </p>
          <div class="space-y-4">
            <h1 class="text-4xl font-semibold text-slate-900">Sign in to continue shopping smarter</h1>
            <p class="text-base text-slate-500">
              Manage orders, track delivery windows, and sync your favorites across devices by logging into your NutriZaria account.
            </p>
          </div>
          <ul class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-sm text-slate-600">
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">1</span>
              One-click checkout with saved payment methods.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">2</span>
              View complete order history and download invoices anytime.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">3</span>
              Personalized recommendations tuned to your pantry needs.
            </li>
          </ul>
          <p class="text-sm text-slate-500">
            Don’t have an account?
            <NuxtLink to="/signup" class="font-semibold text-violet-600 hover:text-violet-500">Create one in seconds</NuxtLink>
          </p>
        </section>

        <section class="space-y-6 rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-lg">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">Welcome back</p>
            <h2 class="mt-3 text-2xl font-semibold text-slate-900">Login or create an account</h2>
          </div>

          <button
            @click="handleGoogleLogin"
            class="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <img src="/images/google-play-button.webp" alt="" class="h-5 w-5 rounded-full object-cover" />
            Continue with Google
          </button>

          <div class="flex items-center gap-3">
            <span class="h-px flex-1 bg-slate-200" />
            <span class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">or</span>
            <span class="h-px flex-1 bg-slate-200" />
          </div>

          <div class="space-y-3">
            <label class="text-sm font-semibold text-slate-600">Phone number</label>
            <div class="flex rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-violet-400">
              <span class="text-sm text-slate-400">+880</span>
              <input
                v-model="phone"
                type="tel"
                placeholder="1XXXXXXXXX"
                class="flex-1 bg-transparent pl-3 text-base text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              @click="handlePhoneLogin"
              class="w-full rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
            >
              Send OTP
            </button>
          </div>

          <div id="recaptcha-container" class="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            reCAPTCHA validation appears here
          </div>

          <div v-if="otpSent" class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <label class="text-sm font-semibold text-slate-600">Enter verification code</label>
            <input
              v-model="otp"
              type="text"
              placeholder="6-digit OTP"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400"
            />
            <button
              @click="verifyOTP"
              class="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Verify & Login
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { signInWithCredential, PhoneAuthProvider } from "firebase/auth";

const { loginWithGoogle, sendOTP, saveUser } = useAuth();
const { $firebase } = useNuxtApp();

const phone = ref("");
const otp = ref("");
const otpSent = ref(false);
let confirmationResult: any;

const handleGoogleLogin = async () => {
  try {
    const user = await loginWithGoogle();
    console.log("Google User:", user);
  } catch (err) {
    alert("Google Login Failed!");
  }
};

const handlePhoneLogin = async () => {
  try {
    confirmationResult = await sendOTP(phone.value, "recaptcha-container");
    otpSent.value = true;
  } catch (err) {
    alert("OTP sending failed!");
  }
};

const verifyOTP = async () => {
  try {
    const credential = PhoneAuthProvider.credential(
      confirmationResult.verificationId,
      otp.value
    );
    const result = await signInWithCredential($firebase.auth, credential);
    await saveUser(result.user);
    alert("Phone login successful!");
  } catch (err) {
    alert("OTP verification failed!");
  }
};
</script>
