import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const userStore = useUserStore();
    userStore.loadAuthenticatedUser();

    if (userStore.authenticatedUser) {
      const target = to.query.redirect;
      const destination =
        typeof target === "string" && target.startsWith("/")
          ? target
          : "/";
      return navigateTo(destination);
    }
  }
});
