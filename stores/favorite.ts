import { defineStore } from "pinia";
import type { Product } from "~/types/product";

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
    addToFavorite(product: Product) {
      if (this.isFavorite(product.id)) return;
      this.items.push(product);
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
