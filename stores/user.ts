import { defineStore } from "pinia";

interface User {
  name?: string;
  email: string;
  password: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    authenticatedUser: null as User | null,
  }),
  actions: {
    registerUser(user: User) {
      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
        this.users = users;
      }
    },
    async loginUser(authUser: User): Promise<boolean> {
      if (typeof window !== "undefined") {
        const users = await JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find(
          (user: User) =>
            user.email === authUser.email && user.password === authUser.password
        );

        if (user) {
          this.authenticatedUser = user;
          localStorage.setItem("authenticatedUser", JSON.stringify(user));
          return true;
        }
      }
      return false;
    },
    logoutUser() {
      this.authenticatedUser = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authenticatedUser");
      }
    },
    loadAuthenticatedUser() {
      if (typeof window !== "undefined") {
        const user = JSON.parse(
          localStorage.getItem("authenticatedUser") || "null"
        );
        if (user) {
          this.authenticatedUser = user;
        }
      }
    },
  },
});
