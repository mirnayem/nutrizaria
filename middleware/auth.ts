import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();
    userStore.loadAuthenticatedUser();
  
    if (!userStore.authenticatedUser && to.path !== '/signup' && process.client) {
      return navigateTo('/signup');
    }
  });
  