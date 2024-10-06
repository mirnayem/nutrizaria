
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
    totalItems: (state): number => {
      const uniqueItems = new Set<number>();
      for (const item of state.items) {
        uniqueItems.add(item.id);
      }
      return uniqueItems.size;
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
      this.saveCartToLocalStorage()
    },
    removeFromCart(itemId: number) {
      this.items = this.items.filter((item) => item.id !== itemId);
      this.saveCartToLocalStorage()
    },
    updateCartItem(itemId: number, type: string) {
      const item = this.items.find((item) => item.id === itemId);
      if (item) {
        if (type === 'DEC' && item.quantity === 1) return;
        type === 'INC' ? item.quantity = item.quantity + 1 : item.quantity = item.quantity - 1;
      }
      this.saveCartToLocalStorage()
    },
    loadCartFromLocalStorage() {

      if(typeof window !== "undefined") {
        const cartData = localStorage.getItem('cart');
      if (cartData) {
        this.items = JSON.parse(cartData);
      }
      }
    },

    saveCartToLocalStorage() {
      if(typeof window !== "undefined") {
        localStorage.setItem('cart', JSON.stringify(this.items));
      }
    },

    clearCart() {
      this.items = [];
      if(typeof window !== "undefined") {
        localStorage.removeItem('cart');
      }
    }
  },
});
