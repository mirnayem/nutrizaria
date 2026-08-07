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
        <div v-if="!sent" class="mb-6">
          <h1 class="text-xl font-semibold text-slate-900">Forgot your password?</h1>
          <p class="mt-1 text-sm text-slate-500">Enter your email and we'll send you a link to reset it.</p>
        </div>

        <template v-if="!sent">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="forgot-email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                id="forgot-email"
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

            <div v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
            >
              <span v-if="loading" class="inline-flex items-center justify-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Sending link...
              </span>
              <span v-else>Send reset link</span>
            </button>
          </form>
        </template>

        <template v-else>
          <div class="rounded-xl bg-emerald-50 px-4 py-4">
            <p class="text-sm font-medium text-emerald-800">Check your email</p>
            <p class="mt-1 text-xs text-emerald-700">
              If an account exists for <span class="font-semibold">{{ email }}</span>, we've sent a link to reset your password.
            </p>
          </div>
        </template>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-500">
            Remember your password?
            <NuxtLink to="/login" class="font-medium text-violet-600 hover:text-violet-700">Sign in</NuxtLink>
          </p>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-slate-500">
        Don't have an account?
        <NuxtLink to="/signup" class="font-medium text-violet-600 hover:text-violet-700">Create one</NuxtLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: false, middleware: "guest" });

useSeo({
  title: "Forgot Password",
  description: "Reset your NutriZaria password.",
  noindex: true,
});

const userStore = useUserStore();

const email = ref("");
const loading = ref(false);
const sent = ref(false);
const errorMessage = ref("");
const errors = reactive({ email: "" });

const handleSubmit = async () => {
  errorMessage.value = "";
  errors.email = "";

  if (!email.value) {
    errors.email = "Email is required";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = "Enter a valid email address";
    return;
  }

  loading.value = true;
  try {
    await userStore.forgotPassword(email.value.trim());
    sent.value = true;
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || err?.message || "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>