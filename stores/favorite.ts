import { defineStore } from "pinia";
import type { Product } from "~/types/product";

const STORAGE_KEY = "nutrizaria.favorites.v1";

export const useFavoriteStore = defineStore("favorite", {
  state: () => ({
    items: [] as Product[],
  }),
  getters: {
    isFavorite: (state) => {
      return (productId: Product["id"]) =>
        state.items.some((item) => item.id === productId);
    },
  },
  actions: {
    loadFavorites() {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this.items = JSON.parse(raw);
      } catch {
        /* ignore */
      }
    },
    persist() {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      }
    },
    addToFavorite(product: Product) {
      if (this.isFavorite(product.id)) return;
      this.items.push(product);
      this.persist();
      const { track } = useMetaPixel();
      track('AddToWishlist', {
        content_ids: [String(product.id)],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'BDT',
      });
    },
    removeFromFavorite(productId: Product["id"]) {
      this.items = this.items.filter((item) => item.id !== productId);
      this.persist();
    },
    toggleFavorite(product: Product) {
      if (this.isFavorite(product.id)) {
        this.removeFromFavorite(product.id);
      } else {
        this.addToFavorite(product);
      }
    },
  },
});
