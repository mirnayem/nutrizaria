import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  userStore.loadAuthenticatedUser();

  if (!userStore.authenticatedUser && process.client) {
    return navigateTo('/login');
  }

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'];
  if (userStore.authenticatedUser && !adminRoles.includes(userStore.authenticatedUser.role)) {
    return navigateTo('/');
  }
});
