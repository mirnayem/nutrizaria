<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4 text-center">Login / Sign Up</h2>

      <!-- Google Login -->
      <button
        @click="handleGoogleLogin"
        class="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg mb-4"
      >
        Continue with Google
      </button>

      <!-- Phone OTP Login -->
      <input
        v-model="phone"
        type="tel"
        placeholder="Enter phone number"
        class="w-full border rounded-lg px-3 py-2 mb-2"
      />
      <button
        @click="handlePhoneLogin"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
      >
        Send OTP
      </button>

      <!-- Captcha container -->
      <div id="recaptcha-container"></div>

      <div v-if="otpSent" class="mt-4">
        <input
          v-model="otp"
          type="text"
          placeholder="Enter OTP"
          class="w-full border rounded-lg px-3 py-2 mb-2"
        />
        <button
          @click="verifyOTP"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
        >
          Verify & Login
        </button>
      </div>
    </div>
  </div>
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
