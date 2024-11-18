import { defineStore } from "pinia";
import { products } from "./data";
import type { Product } from "~/types/product";
export const useProductStore = defineStore("product", {
  state: () => ({
    products: [] as Product[],
  }),
  actions: {
    searchProducts(searchTerm: string) {
      this.products = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
  },
});
