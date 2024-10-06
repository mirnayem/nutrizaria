
import { defineStore } from 'pinia';

import type { CartItem } from '~/types/product';

interface CartState {
  items: CartItem[]  
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  user: { id: number; name: string } | null
}

export const useCartStore = defineStore('cart', {
  state: ():CartState => ({
    items: [],
    isCartOpen:false,
    totalItems: 0,
    totalPrice: 0,
    user: null
  }),
  getters: {
    totalItems(state): number {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    totalPrice(state): number {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    toggleCart(state): boolean {
      return state.isCartOpen = !this.isCartOpen
    }
  },
  actions: {
    addToCart(item: CartItem) {      
      const existingItem = this.items.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({...item, quantity: 1});
      }
    },
    removeFromCart(itemId: number) {
      this.items = this.items.filter((item) => item.id !== itemId);
    },
    updateCartItem(itemId: number, quantity: number) {
      const item = this.items.find((item) => item.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart() {
      this.items = [];
    },
  },
});
