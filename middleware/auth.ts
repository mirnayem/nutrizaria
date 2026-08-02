import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const userStore = useUserStore();
    userStore.loadAuthenticatedUser();

    if (!userStore.authenticatedUser) {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }
  }
});
