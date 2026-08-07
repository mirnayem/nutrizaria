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
        <template v-if="invalidLink">
          <div class="text-center">
            <h1 class="text-xl font-semibold text-slate-900">Invalid reset link</h1>
            <p class="mt-2 text-sm text-slate-500">
              This link is invalid or has expired. Please request a new one.
            </p>
            <NuxtLink
              to="/forgot-password"
              class="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Request a new link
            </NuxtLink>
          </div>
        </template>

        <template v-else-if="done">
          <div class="text-center">
            <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <svg class="size-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 class="mt-4 text-xl font-semibold text-slate-900">Password reset</h1>
            <p class="mt-1 text-sm text-slate-500">Your password has been changed. You can now sign in.</p>
            <NuxtLink
              to="/login"
              class="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Sign in
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <div class="mb-6">
            <h1 class="text-xl font-semibold text-slate-900">Set a new password</h1>
            <p class="mt-1 text-sm text-slate-500">Choose a strong password you don't use elsewhere.</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="new-password" class="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
              <input
                id="new-password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="At least 6 characters"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.password }"
              />
              <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
            </div>

            <div>
              <label for="confirm-password" class="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                id="confirm-password"
                v-model="confirm"
                type="password"
                autocomplete="new-password"
                placeholder="Re-enter your new password"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.confirm }"
              />
              <p v-if="errors.confirm" class="mt-1 text-xs text-red-600">{{ errors.confirm }}</p>
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
                Resetting password...
              </span>
              <span v-else>Reset password</span>
            </button>
          </form>
        </template>
      </div>

      <p class="mt-6 text-center text-sm text-slate-500">
        <NuxtLink to="/login" class="font-medium text-violet-600 hover:text-violet-700">Back to sign in</NuxtLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: false, middleware: "guest" });

const route = useRoute();
const userStore = useUserStore();

const resetToken = ref("");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const done = ref(false);
const invalidLink = ref(false);
const errorMessage = ref("");
const errors = reactive({ password: "", confirm: "" });

useSeo({
  title: "Reset Password",
  description: "Set a new password for your NutriZaria account.",
  noindex: true,
});

onMounted(() => {
  const token = route.query.token;
  if (typeof token !== "string" || !token) {
    invalidLink.value = true;
  } else {
    resetToken.value = token;
  }
});

const handleSubmit = async () => {
  errorMessage.value = "";
  errors.password = "";
  errors.confirm = "";

  if (!resetToken.value) {
    invalidLink.value = true;
    return;
  }
  if (!password.value || password.value.length < 6) {
    errors.password = "Password must be at least 6 characters";
    return;
  }
  if (password.value !== confirm.value) {
    errors.confirm = "Passwords do not match";
    return;
  }

  loading.value = true;
  try {
    await userStore.resetPassword(resetToken.value, password.value);
    done.value = true;
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || err?.message || "Something went wrong. Please try again.";
    if (errorMessage.value.toLowerCase().includes("invalid") || errorMessage.value.toLowerCase().includes("expired")) {
      invalidLink.value = true;
    }
  } finally {
    loading.value = false;
  }
};
</script>