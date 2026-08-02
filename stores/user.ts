import { defineStore } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import type {
  Address,
  AddressInput,
  ProfileInput,
  UserAccount,
} from "~/types/account";

interface User extends UserAccount {
  password?: string;
}

interface UserState {
  users: User[];
  authenticatedUser: User | null;
  apiToken: string | null;
  useApi: boolean;
  orders: any[];
  addresses: Address[];
  profileLoading: boolean;
  ordersLoading: boolean;
  addressesLoading: boolean;
}

const addressesKey = "nutrizaria.addresses.v1";

const readAddressesFor = (email: string): Address[] => {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(addressesKey) || "{}");
    return Array.isArray(all[email]) ? all[email] : [];
  } catch {
    return [];
  }
};

const writeAddressesFor = (email: string, addresses: Address[]) => {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(addressesKey) || "{}");
    all[email] = addresses;
    localStorage.setItem(addressesKey, JSON.stringify(all));
  } catch {
    /* ignore */
  }
};

const clone = <T>(payload: T): T => JSON.parse(JSON.stringify(payload));

const persistSession = (token: string, user: User) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  localStorage.setItem("authenticatedUser", JSON.stringify(user));
  document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

const authHeaders = (token: string | null) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    users: [],
    authenticatedUser: null,
    apiToken: null,
    useApi: false,
    orders: [],
    addresses: [],
    profileLoading: false,
    ordersLoading: false,
    addressesLoading: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.authenticatedUser,
    displayName: (state): string =>
      state.authenticatedUser?.name?.trim() ||
      (state.authenticatedUser?.email || "").split("@")[0] ||
      "Guest",
    initials: (state): string => {
      const name =
        state.authenticatedUser?.name?.trim() ||
        (state.authenticatedUser?.email || "").split("@")[0];
      const parts = name.split(/\s+/).filter(Boolean);
      return (
        (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
      ).toUpperCase();
    },
    defaultAddress: (state): Address | null =>
      state.addresses.find((a) => a.isDefault) || state.addresses[0] || null,
  },
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
          const user: User = {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name,
            phone: result.data.user.phone,
            role: result.data.user.role,
            avatar: result.data.user.avatar,
          };
          this.authenticatedUser = user;
          this.useApi = true;
          persistSession(result.data.accessToken, user);
          return true;
        }
      } catch (error) {
        console.warn("[user] API login failed, falling back to local");
      }
      return false;
    },

    async registerApi(data: {
      email: string;
      password: string;
      name?: string;
      phone?: string;
    }): Promise<boolean> {
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
          const user: User = {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name,
            phone: result.data.user.phone,
            role: result.data.user.role,
            avatar: result.data.user.avatar,
          };
          this.authenticatedUser = user;
          this.useApi = true;
          persistSession(result.data.accessToken, user);
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
      const apiResult = await this.loginApi(authUser.email, authUser.password || "");
      if (apiResult) return true;

      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find(
          (user: User) =>
            user.email === authUser.email && user.password === authUser.password
        );
        if (user) {
          this.authenticatedUser = clone(user);
          this.useApi = false;
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
      this.orders = [];
      this.addresses = [];
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

    async fetchProfile() {
      if (!this.useApi || !this.apiToken || !this.authenticatedUser?.id) return;
      this.profileLoading = true;
      try {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const result = await $fetch(`${apiBase}/auth/profile`, {
          headers: authHeaders(this.apiToken),
        });
        const profile = result?.data ?? result;
        if (profile) {
          this.authenticatedUser = {
            ...this.authenticatedUser,
            id: profile.id,
            email: profile.email,
            name: profile.name,
            phone: profile.phone,
            role: profile.role,
            avatar: profile.avatar,
            createdAt: profile.createdAt,
          };
          if (Array.isArray(profile.addresses)) {
            this.addresses = profile.addresses;
          }
          localStorage.setItem(
            "authenticatedUser",
            JSON.stringify(this.authenticatedUser)
          );
        }
      } catch (error) {
        console.warn("[user] Failed to fetch profile", error);
      } finally {
        this.profileLoading = false;
      }
    },

    async updateProfile(input: ProfileInput) {
      if (this.useApi && this.apiToken) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const result = await $fetch(`${apiBase}/auth/profile`, {
          method: "PUT",
          headers: authHeaders(this.apiToken),
          body: input,
        });
        const profile = result?.data ?? result;
        if (profile) {
          this.authenticatedUser = {
            ...this.authenticatedUser!,
            name: profile.name,
            phone: profile.phone,
            avatar: profile.avatar,
          };
          localStorage.setItem(
            "authenticatedUser",
            JSON.stringify(this.authenticatedUser)
          );
          return profile;
        }
      }

      if (typeof window !== "undefined" && this.authenticatedUser) {
        const user = this.authenticatedUser;
        const next = { ...user, ...input };
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const index = users.findIndex((u: User) => u.email === user.email);
        if (index > -1) {
          users[index] = { ...users[index], ...input };
          localStorage.setItem("users", JSON.stringify(users));
        }
        this.authenticatedUser = next;
        localStorage.setItem("authenticatedUser", JSON.stringify(next));
        return next;
      }
      throw new Error("Profile update failed");
    },

    async changePassword(input: {
      currentPassword: string;
      newPassword: string;
    }) {
      if (this.useApi && this.apiToken) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const result = await $fetch(`${apiBase}/auth/change-password`, {
          method: "POST",
          headers: authHeaders(this.apiToken),
          body: input,
        });
        return result?.data ?? result;
      }

      if (typeof window !== "undefined" && this.authenticatedUser) {
        const email = this.authenticatedUser.email;
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const index = users.findIndex((u: User) => u.email === email);
        if (index > -1) {
          if (users[index].password !== input.currentPassword) {
            throw new Error("Current password is incorrect");
          }
          users[index].password = input.newPassword;
          localStorage.setItem("users", JSON.stringify(users));
          return { message: "Password updated successfully" };
        }
        throw new Error("No local account found for this email");
      }
      throw new Error("Password change failed");
    },

    async fetchOrders() {
      if (!this.authenticatedUser) return;
      if (this.useApi && this.apiToken) {
        this.ordersLoading = true;
        try {
          const config = useRuntimeConfig();
          const apiBase = config.public.apiBase;
          const result = await $fetch(`${apiBase}/orders?page=1&limit=50`, {
            headers: authHeaders(this.apiToken),
          });
          this.orders = result?.data?.items ?? result?.items ?? [];
        } catch (error) {
          console.warn("[user] Failed to fetch orders", error);
        } finally {
          this.ordersLoading = false;
        }
        return;
      }

      this.ordersLoading = true;
      try {
        const catalogStore = useCatalogStore();
        await catalogStore.hydrate();
        const email = this.authenticatedUser.email;
        this.orders = catalogStore.orders.filter(
          (order) => !order.customerEmail || order.customerEmail === email
        );
      } finally {
        this.ordersLoading = false;
      }
    },

    async fetchAddresses() {
      if (!this.authenticatedUser) return;
      if (this.useApi && this.apiToken) {
        this.addressesLoading = true;
        try {
          const config = useRuntimeConfig();
          const apiBase = config.public.apiBase;
          const result = await $fetch(`${apiBase}/auth/addresses`, {
            headers: authHeaders(this.apiToken),
          });
          this.addresses = result?.data ?? result ?? [];
        } catch (error) {
          console.warn("[user] Failed to fetch addresses", error);
        } finally {
          this.addressesLoading = false;
        }
        return;
      }

      this.addresses = readAddressesFor(this.authenticatedUser.email);
    },

    async saveAddress(input: AddressInput, id?: string) {
      if (this.useApi && this.apiToken) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const body: AddressInput = {
          ...input,
          country: input.country || "Bangladesh",
        };
        if (id) {
          const result = await $fetch(`${apiBase}/auth/addresses/${id}`, {
            method: "PUT",
            headers: authHeaders(this.apiToken),
            body,
          });
          const updated = result?.data ?? result;
          if (body.isDefault) {
            this.addresses = this.addresses.map((a) => ({
              ...a,
              isDefault: a.id === id ? true : false,
            }));
          } else {
            this.addresses = this.addresses.map((a) =>
              a.id === id ? updated : a
            );
          }
        } else {
          const result = await $fetch(`${apiBase}/auth/addresses`, {
            method: "POST",
            headers: authHeaders(this.apiToken),
            body,
          });
          const created = result?.data ?? result;
          if (body.isDefault) {
            this.addresses = this.addresses.map((a) => ({
              ...a,
              isDefault: false,
            }));
          }
          this.addresses = [...this.addresses, created];
        }
        return;
      }

      if (!this.authenticatedUser) throw new Error("Not authenticated");
      const email = this.authenticatedUser.email;
      let list = readAddressesFor(email);
      if (input.isDefault || list.length === 0) {
        list = list.map((a) => ({ ...a, isDefault: false }));
      }
      if (id) {
        list = list.map((a) => (a.id === id ? { ...a, ...input, id } : a));
      } else {
        list.push({
          ...input,
          country: input.country || "Bangladesh",
          id: `addr-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
          isDefault: list.length === 0 ? true : input.isDefault ?? false,
        });
      }
      writeAddressesFor(email, list);
      this.addresses = list;
    },

    async deleteAddress(id: string) {
      if (this.useApi && this.apiToken) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        await $fetch(`${apiBase}/auth/addresses/${id}`, {
          method: "DELETE",
          headers: authHeaders(this.apiToken),
        });
        this.addresses = this.addresses.filter((a) => a.id !== id);
        return;
      }

      if (!this.authenticatedUser) return;
      const email = this.authenticatedUser.email;
      const list = readAddressesFor(email).filter((a) => a.id !== id);
      writeAddressesFor(email, list);
      this.addresses = list;
    },
  },
});
