import { defineStore } from "pinia";
import type { Product } from "~/types/product";


export const useFavoriteStore = defineStore('favorite', {
    state: () => ({
        items: [] as Product[]
    }),
    actions: {
        addToFavorite(product: Product) {
            const exist = this.items.find((item) => item.id === product.id)
            if (exist) return;
            this.items.push(product)
        }
    },
})