<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-lg font-semibold text-violet-700">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">NZ</span>
          NutriZaria
        </NuxtLink>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="mb-6">
          <h1 class="text-xl font-semibold text-slate-900">Create your account</h1>
          <p class="mt-1 text-sm text-slate-500">Start shopping with NutriZaria today</p>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          @click="handleGoogleSignup"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div class="my-5 flex items-center gap-3">
          <div class="h-px flex-1 bg-slate-200"></div>
          <span class="text-xs text-slate-400">or</span>
          <div class="h-px flex-1 bg-slate-200"></div>
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <label for="signup-name" class="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input
              id="signup-name"
              v-model="name"
              type="text"
              required
              autocomplete="name"
              placeholder="Your full name"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <label for="signup-email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="signup-email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="signup-password" class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div class="relative">
              <input
                id="signup-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="At least 6 characters"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.password }"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg v-if="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
          </div>

          <div v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Creating account...
            </span>
            <span v-else>Create account</span>
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-slate-500">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-violet-600 hover:text-violet-700">Sign in</NuxtLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: false });

const router = useRouter();
const userStore = useUserStore();
const { loginWithGoogle } = useAuth();

const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const errors = reactive({ name: "", email: "", password: "" });

const validate = () => {
  errors.name = "";
  errors.email = "";
  errors.password = "";
  let valid = true;

  if (!name.value.trim()) {
    errors.name = "Name is required";
    valid = false;
  }

  if (!email.value) {
    errors.email = "Email is required";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = "Enter a valid email address";
    valid = false;
  }

  if (!password.value) {
    errors.password = "Password is required";
    valid = false;
  } else if (password.value.length < 6) {
    errors.password = "Password must be at least 6 characters";
    valid = false;
  }

  return valid;
};

const handleRegister = async () => {
  errorMessage.value = "";
  if (!validate()) return;

  loading.value = true;
  try {
    userStore.registerUser({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    const success = await userStore.loginUser({
      email: email.value,
      password: password.value,
    });

    if (success) {
      router.push("/");
    } else {
      errorMessage.value = "Account created but login failed. Please sign in manually.";
      router.push("/login");
    }
  } catch (err) {
    errorMessage.value = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleGoogleSignup = async () => {
  errorMessage.value = "";
  try {
    await loginWithGoogle();
    router.push("/");
  } catch (err) {
    errorMessage.value = "Google sign-up failed. Please try again.";
  }
};
</script>
