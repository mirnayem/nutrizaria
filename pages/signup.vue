<template>
  <ClientOnly>
    <div
      class="signup-login max-w-md mx-auto text-center bg-orange-200 rounded p-10 min-h-[350px]"
    >
      <div v-if="authStatus == 'signup'">
        <h1 class="text-2xl font-light text-white">Signup</h1>

        <form class="grid gap-5 mt-5" @submit.prevent="register">
          <input
            class="border-2 px-3 py-1 rounded focus:outline-none"
            v-model="name"
            placeholder="name"
            required
          />
          <input
            class="border-2 px-3 py-1 rounded focus:outline-none"
            v-model="email"
            placeholder="Email"
            required
          />
          <input
            class="border-2 px-3 py-1 rounded focus:outline-none"
            v-model="password"
            type="password"
            placeholder="Password"
            required
          />
          <button
            class="max-w-44 mx-auto px-5 py-2 rounded bg-orange-700 text-white font-semibold"
            type="submit"
            :class="{ 'cursor-not-allowed': loading }"
          >
            Signup
          </button>
        </form>
      </div>
      <div v-else>
        <h1 class="text-2xl font-light text-white">Login</h1>
        <form class="grid gap-5 mt-5" @submit.prevent="login">
          <input
            class="border-2 px-3 py-1 rounded focus:outline-none"
            v-model="email"
            placeholder="Email"
            required
          />
          <input
            class="border-2 px-3 py-1 rounded focus:outline-none"
            v-model="password"
            type="password"
            placeholder="Password"
            required
          />
          <button
            class="max-w-44 mx-auto px-5 py-2 rounded bg-orange-700 text-white font-semibold"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
      <div
        v-if="authStatus === 'signup'"
        class="toggle mt-4 text-sm font-light"
      >
        Already have an account
        <span
          class="text-orange-600 font-light cursor-pointer"
          @click="updateStatus('login')"
          >login</span
        >
      </div>
      <div v-if="authStatus === 'login'" class="toggle mt-4 text-sm font-light">
        Register now
        <span
          class="text-orange-600 font-light cursor-pointer"
          @click="updateStatus('signup')"
          >signup</span
        >
      </div>
    </div>
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
