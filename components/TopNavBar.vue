<template>
  <section class="navbar flex items-center h-8 bg-orange-700">
    <div
      class="container flex justify-between items-center text-white lg:px-0 px-4"
    >
      <div class="navbar__left text-xs flex gap-4 items-center">
        <p class="navbar__email flex items-center gap-1">
          <span><EnvelopeIcon class="size-4 text-white" /></span>
          hello@nutriakl.com
        </p>
        <div class="border-l border-gray-300 h-3 sm:block hidden"></div>
        <p class="navbar__offer sm:block hidden">
          Free Shipping for all Orders of $99
        </p>
      </div>
      <div class="navbar__right flex items-center gap-2">
        <div class="navbar__social">
          <NuxtLink
            class="navbar__social-link"
            to="https://www.facebook.com/profile.php?id=61565027387612"
            title="notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              ></path>
            </svg>
          </NuxtLink>
        </div>
        <div class="border-l border-gray-300 h-3"></div>
        <div class="navbar__language text-xs">
          <p>English</p>
        </div>
        <div class="border-l border-gray-300 h-3"></div>
        <div class="navbar__signup text-xs">
          <NuxtLink to="/signup" class="navbar__signup--link capitalize" v-once>
            {{ signupText() }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { EnvelopeIcon } from "@heroicons/vue/16/solid";
import { useUserStore } from "~/stores/user";
const userStore = useUserStore();

const signupText = () => {
    return !userStore.authenticatedUser
      ? "Signup"
      : userStore.authenticatedUser.name;
};
</script>

<style></style>
