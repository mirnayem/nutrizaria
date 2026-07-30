import { defineStore } from "pinia";

interface User {
  name?: string;
  email: string;
  password: string;
  role?: string;
  id?: string;
  avatar?: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    authenticatedUser: null as User | null,
    apiToken: null as string | null,
    useApi: false,
  }),
  actions: {
    async loginApi(email: string, password: string): Promise<boolean> {
      try {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        if (!apiBase) return false;

        const result = await $fetch(`${apiBase}/auth/login`, {
          method: "POST",
          body: { email, password },
        });

        if (result?.data?.accessToken) {
          this.apiToken = result.data.accessToken;
          this.authenticatedUser = {
            email: result.data.user.email,
            name: result.data.user.name,
            role: result.data.user.role,
            id: result.data.user.id,
            avatar: result.data.user.avatar,
            password: "",
          };
          this.useApi = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", result.data.accessToken);
            localStorage.setItem("authenticatedUser", JSON.stringify(this.authenticatedUser));
            // Also set cookie for admin panel
            document.cookie = `auth_token=${result.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return true;
        }
      } catch (error) {
        console.warn("[user] API login failed, falling back to local");
      }
      return false;
    },

    async registerApi(data: { email: string; password: string; name?: string }): Promise<boolean> {
      try {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        if (!apiBase) return false;

        const result = await $fetch(`${apiBase}/auth/register`, {
          method: "POST",
          body: data,
        });

        if (result?.data?.accessToken) {
          this.apiToken = result.data.accessToken;
          this.authenticatedUser = {
            email: result.data.user.email,
            name: result.data.user.name,
            role: result.data.user.role,
            id: result.data.user.id,
            avatar: result.data.user.avatar,
            password: "",
          };
          this.useApi = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", result.data.accessToken);
            localStorage.setItem("authenticatedUser", JSON.stringify(this.authenticatedUser));
            // Also set cookie for admin panel
            document.cookie = `auth_token=${result.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return true;
        }
      } catch (error) {
        console.warn("[user] API register failed, falling back to local");
      }
      return false;
    },

    registerUser(user: User) {
      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
        this.users = users;
      }
    },
    async loginUser(authUser: User): Promise<boolean> {
      const apiResult = await this.loginApi(authUser.email, authUser.password);
      if (apiResult) return true;

      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
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
      this.apiToken = null;
      this.useApi = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authenticatedUser");
        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
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
        const token = localStorage.getItem("auth_token");
        if (token) {
          this.apiToken = token;
          this.useApi = true;
        }
      }
    },
  },
});