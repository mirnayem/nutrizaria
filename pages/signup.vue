<template>
  <ClientOnly>
    <main class="min-h-screen bg-gradient-to-b from-violet-100 via-white to-slate-50 py-12">
      <div class="mx-auto max-w-6xl rounded-3xl border border-violet-100 bg-white/90 p-8 shadow-2xl lg:p-12">
        <div class="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <section class="space-y-6 rounded-3xl bg-violet-950 px-8 py-12 text-violet-50">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              Join the community
            </p>
            <h1 class="text-4xl font-semibold">Create an account for effortless grocery planning</h1>
            <p class="text-base text-violet-200">
              Sync your favorite organic picks, track orders, and receive seasonal alerts. Sign up once and enjoy personalized recommendations tailored to your pantry goals.
            </p>
            <ul class="space-y-4 text-sm text-violet-200/90">
              <li class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">✓</span>
                Faster checkout with saved info and delivery addresses.
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">✓</span>
                Exclusive offers tailored to your shopping habits.
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">✓</span>
                Share wishlists and favorite collections with family.
              </li>
            </ul>
            <div class="rounded-2xl bg-white/10 p-4 text-sm text-violet-100">
              Already a member? Switch to the login tab to access your dashboard instantly.
            </div>
          </section>

          <section class="rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-xl">
            <div class="mb-8 flex gap-3 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-500">
              <button
                type="button"
                @click="updateStatus('signup')"
                :class="[
                  'flex-1 rounded-full px-4 py-2 transition',
                  authStatus === 'signup' ? 'bg-white text-violet-700 shadow' : 'text-slate-500',
                ]"
              >
                Sign up
              </button>
              <button
                type="button"
                @click="updateStatus('login')"
                :class="[
                  'flex-1 rounded-full px-4 py-2 transition',
                  authStatus === 'login' ? 'bg-white text-violet-700 shadow' : 'text-slate-500',
                ]"
              >
                Log in
              </button>
            </div>

            <div v-if="authStatus === 'signup'" class="space-y-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">Welcome</p>
                <h2 class="mt-3 text-3xl font-semibold text-slate-900">Let’s set up your account</h2>
                <p class="mt-2 text-sm text-slate-500">We’ll keep your information secure and never share it.</p>
              </div>
              <form class="space-y-4" @submit.prevent="register">
                <label class="block text-left text-sm font-semibold text-slate-600">
                  Full name
                  <input
                    class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400"
                    v-model="name"
                    placeholder="e.g. Sara Rahman"
                    required
                  />
                </label>
                <label class="block text-left text-sm font-semibold text-slate-600">
                  Email address
                  <input
                    class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400"
                    v-model="email"
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                </label>
                <label class="block text-left text-sm font-semibold text-slate-600">
                  Password
                  <input
                    class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400"
                    v-model="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </label>
                <button
                  class="w-full rounded-2xl bg-violet-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-violet-500"
                  type="submit"
                  :disabled="loading"
                  :class="{ 'opacity-60': loading }"
                >
                  {{ loading ? "Creating account..." : "Create account" }}
                </button>
              </form>
            </div>

            <div v-else class="space-y-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">Welcome back</p>
                <h2 class="mt-3 text-3xl font-semibold text-slate-900">Log in to continue</h2>
                <p class="mt-2 text-sm text-slate-500">Access your dashboard, saved addresses, and favorites.</p>
              </div>
              <form class="space-y-4" @submit.prevent="login">
                <label class="block text-left text-sm font-semibold text-slate-600">
                  Email address
                  <input
                    class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400"
                    v-model="email"
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                </label>
                <label class="block text-left text-sm font-semibold text-slate-600">
                  Password
                  <input
                    class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400"
                    v-model="password"
                    type="password"
                    placeholder="Your password"
                    required
                  />
                </label>
                <button
                  class="w-full rounded-2xl bg-violet-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-violet-500"
                  type="submit"
                >
                  Log in
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  </ClientOnly>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const router = useRouter();
const authStatus = ref("signup");
const name = ref("");
const email = ref("");
const password = ref("");
const userStore = useUserStore();
const loading = ref(false);

const updateStatus = (type) => {
  authStatus.value = type;
};
const register = () => {
  loading.value = true;
  userStore.registerUser({
    name: name.value,
    email: email.value,
    password: password.value,
  });
  setTimeout(() => {
    login();
    loading.value = false;
    router.push("/");
  }, 2000);
};

const login = () => {
  userStore.loginUser({ email: email.value, password: password.value });
  router.push("/");
};
</script>
