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
      return state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    totalPrice(state): number {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    uniqueProductsCount: (state): number => {
      const uniqueProducts = new Set<string>();
      for (const item of state.items) {
        uniqueProducts.add(item.productId);
      }
      return uniqueProducts.size;
    },
  },
  actions: {
    
    addToCart(item: CartItem | Product, quantity = 1) {
      const qty = Math.max(1, Math.floor(quantity));
      
      // Handle both Product and CartItem
      const productId = 'productId' in item ? item.productId : item.id;
      const variantId = 'variantId' in item ? item.variantId : (item as any)._variant?.id;
      const _variant = (item as any)._variant;
      const variantLabel = 'variantLabel' in item
        ? item.variantLabel
        : (_variant && _variant.weight > 0 && _variant.unit ? `${_variant.weight}${_variant.unit}` : _variant?.label);
      const variantPrice = 'variantId' in item ? item.price : _variant?.price;
      const itemSale = (item as any).salePrice;
      const variantSale = 'variantId' in item ? itemSale : (_variant?.salePrice ?? itemSale);
      const now = Date.now();
      const saleActive =
        variantSale != null &&
        variantSale > 0 &&
        variantSale < (variantPrice ?? item.price) &&
        (!(item as any).saleStartAt || new Date((item as any).saleStartAt).getTime() <= now) &&
        (!(item as any).saleEndAt || new Date((item as any).saleEndAt).getTime() >= now);
      const price = saleActive ? variantSale : (variantPrice ?? item.price);
      
      const cartItem: CartItem = {
        id: variantId ? `${productId}-${variantId}` : productId,
        productId,
        variantId,
        name: item.name,
        image: variantId ? (item as any)._variant?.image || item.image : item.image,
        price,
        quantity: qty,
        unit: variantId
          ? (item as any)._variant?.unit || item.unit
          : ((item as any).weight && item.unit ? `${(item as any).weight}${item.unit}` : item.unit),
        variantLabel,
      };
      
      const existingItem = this.items.find((i) => i.id === cartItem.id);
      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        this.items.push(cartItem);
      }
      this.saveCartToLocalStorage();
      const { track } = useMetaPixel();
      track('AddToCart', {
        content_ids: [cartItem.id],
        content_name: cartItem.name + (cartItem.variantLabel ? ` - ${cartItem.variantLabel}` : ''),
        content_type: 'product',
        value: cartItem.price * qty,
        currency: 'BDT',
      });
    },
    removeFromCart(itemId: string) {
      this.items = this.items.filter((item) => item.id !== itemId);
      this.saveCartToLocalStorage()
    },
    updateCartItem(itemId: string, type: string) {
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