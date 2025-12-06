import { defineStore } from "pinia";
import { useCatalogStore } from "./catalog";
import type { Product } from "~/types/product";

export const useProductStore = defineStore("product", {
  state: () => ({
    products: [] as Product[],
    searchTerm: "",
    loading: false,
  }),
  actions: {
    searchProducts(searchTerm: string) {
      const catalog = useCatalogStore();
      catalog.hydrate();
      const normalized = searchTerm.trim().toLowerCase();
      this.searchTerm = normalized;
      this.products = catalog.products.filter((product: Product) => {
        const haystack = `${product.name} ${product.category}`.toLowerCase();
        return haystack.includes(normalized);
      });
    },
    loadAllProducts() {
      const catalog = useCatalogStore();
      catalog.hydrate();
      this.products = catalog.products;
    },
  },
});
