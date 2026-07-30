
import { defineStore } from 'pinia';
import type { CartItem, Product } from '~/types/product';
interface CartState {
  items: CartItem[]  
  isCartOpen: boolean
}

export const useCartStore = defineStore('cart', {
  state: ():CartState => ({
    items: [],
    isCartOpen:false,
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
  },
  actions: {
    
    addToCart(item: CartItem | Product) {
      const cartItem: CartItem = 'quantity' in item ? { ...item } : { ...item, quantity: 1 };
      const existingItem = this.items.find((i) => i.id === cartItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push(cartItem);
      }
      this.saveCartToLocalStorage();
      const { track } = useMetaPixel();
      track('AddToCart', {
        content_ids: [String(cartItem.id)],
        content_name: cartItem.name,
        content_type: 'product',
        value: cartItem.price,
        currency: 'BDT',
      });
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
    },
    toggleCart() {
      return this.isCartOpen = !this.isCartOpen
    }
  },
});
