import { defineStore } from "pinia";
import { products as seedProducts, categories as seedCategories, faqs as seedFaqs } from "./data";
import type {
  CartItem,
  Category,
  Faq,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  PaymentSummary,
  Product,
  ProductInput,
  ShippingAddress,
} from "~/types/product";

type CatalogSnapshot = {
  products: Product[];
  categories: Category[];
  faqs: Faq[];
  orders: OrderRecord[];
  nextProductId: number;
};

interface CatalogState extends CatalogSnapshot {
  hydrated: boolean;
}

const STORAGE_KEY = "nutrizaria.catalog.v1";
const isClient = typeof window !== "undefined";

const clone = <T>(payload: T): T => JSON.parse(JSON.stringify(payload));

const buildSeedSnapshot = (): CatalogSnapshot => {
  const nextProductId =
    seedProducts.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  return {
    products: clone(seedProducts),
    categories: clone(seedCategories),
    faqs: clone(seedFaqs),
    orders: [],
    nextProductId,
  };
};

const DEFAULT_SNAPSHOT = buildSeedSnapshot();

const readSnapshotFromStorage = (): CatalogSnapshot | null => {
  if (!isClient) return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      products: parsed.products ?? clone(seedProducts),
      categories: parsed.categories ?? clone(seedCategories),
      faqs: parsed.faqs ?? clone(seedFaqs),
      orders: parsed.orders ?? [],
      nextProductId:
        typeof parsed.nextProductId === "number"
          ? parsed.nextProductId
          : DEFAULT_SNAPSHOT.nextProductId,
    };
  } catch (error) {
    console.error("[catalog] Failed to parse stored snapshot:", error);
    return null;
  }
};

const writeSnapshotToStorage = (snapshot: CatalogSnapshot) => {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

const createOrderId = () => {
  const random = Math.floor(Math.random() * 1e6)
    .toString(36)
    .toUpperCase();
  return `NZR-${Date.now().toString(36).toUpperCase()}-${random}`;
};

type OrderPayload = {
  items: CartItem[];
  shipping: ShippingAddress;
  payment: PaymentSummary;
  customerEmail?: string;
  total?: number;
};

export const useCatalogStore = defineStore("catalog", {
  state: (): CatalogState => ({
    ...clone(DEFAULT_SNAPSHOT),
    hydrated: false,
  }),
  getters: {
    productById: (state) => (id: number) =>
      state.products.find((product) => product.id === id),
    productsByCategory: (state) => (slug: string) =>
      state.products.filter((product) => product.category === slug),
    orderStats: (state) => {
      const summary = state.orders.reduce(
        (acc, order) => {
          acc.totalRevenue += order.total;
          acc[order.status] = (acc[order.status] ?? 0) + 1;
          return acc;
        },
        {
          totalRevenue: 0,
          pending: 0,
          paid: 0,
          fulfilled: 0,
          cancelled: 0,
        } as Record<OrderStatus | "totalRevenue", number>
      );
      return summary;
    },
    featuredProducts: (state) => state.products.slice(0, 4),
  },
  actions: {
    hydrate() {
      if (this.hydrated) return;
      const snapshot = readSnapshotFromStorage() ?? clone(DEFAULT_SNAPSHOT);
      this.applySnapshot(snapshot);
      this.hydrated = true;
    },
    applySnapshot(snapshot: CatalogSnapshot) {
      this.products = clone(snapshot.products);
      this.categories = clone(snapshot.categories);
      this.faqs = clone(snapshot.faqs);
      this.orders = clone(snapshot.orders);
      this.nextProductId = snapshot.nextProductId;
      this.persist();
    },
    persist() {
      const snapshot: CatalogSnapshot = {
        products: this.products,
        categories: this.categories,
        faqs: this.faqs,
        orders: this.orders,
        nextProductId: this.nextProductId,
      };
      writeSnapshotToStorage(snapshot);
    },
    ensureHydrated() {
      if (!this.hydrated) {
        this.hydrate();
      }
    },
    addProduct(payload: ProductInput) {
      this.ensureHydrated();
      const product: Product = {
        ...payload,
        id: this.nextProductId++,
      };
      this.products = [product, ...this.products];
      this.persist();
      return product;
    },
    updateProduct(updatedProduct: Product) {
      this.ensureHydrated();
      this.products = this.products.map((product) =>
        product.id === updatedProduct.id ? { ...updatedProduct } : product
      );
      this.persist();
    },
    deleteProduct(productId: number) {
      this.ensureHydrated();
      this.products = this.products.filter(
        (product) => product.id !== productId
      );
      this.persist();
    },
    recordOrder(payload: OrderPayload) {
      this.ensureHydrated();
      const total =
        payload.total ??
        payload.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      const order: OrderRecord = {
        id: createOrderId(),
        createdAt: new Date().toISOString(),
        items: clone(payload.items),
        total,
        status: payload.payment.status === "paid" ? "paid" : "pending",
        shipping: clone(payload.shipping),
        payment: { ...payload.payment },
        customerEmail: payload.customerEmail,
      };
      this.orders = [order, ...this.orders];
      this.persist();
      return order;
    },
    updateOrderStatus(orderId: string, status: OrderStatus) {
      this.ensureHydrated();
      this.orders = this.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      );
      this.persist();
    },
    updatePaymentStatus(orderId: string, status: PaymentSummary["status"]) {
      this.ensureHydrated();
      this.orders = this.orders.map((order) =>
        order.id === orderId
          ? { ...order, payment: { ...order.payment, status } }
          : order
      );
      this.persist();
    },
    resetToSeedData() {
      this.applySnapshot(clone(DEFAULT_SNAPSHOT));
    },
    exportSnapshot(pretty = true) {
      this.ensureHydrated();
      const snapshot: CatalogSnapshot = {
        products: this.products,
        categories: this.categories,
        faqs: this.faqs,
        orders: this.orders,
        nextProductId: this.nextProductId,
      };
      return JSON.stringify(snapshot, null, pretty ? 2 : undefined);
    },
    importSnapshot(input: string | CatalogSnapshot) {
      try {
        const snapshot =
          typeof input === "string" ? JSON.parse(input) : input;
        if (!snapshot.products || !snapshot.categories) {
          throw new Error("Malformed snapshot");
        }
        this.applySnapshot({
          products: snapshot.products,
          categories: snapshot.categories,
          faqs: snapshot.faqs ?? clone(seedFaqs),
          orders: snapshot.orders ?? [],
          nextProductId:
            snapshot.nextProductId ??
            snapshot.products.reduce(
              (max: number, product: Product) => Math.max(max, product.id),
              0
            ) +
              1,
        });
        this.hydrated = true;
      } catch (error) {
        console.error("[catalog] Unable to import snapshot", error);
        throw error;
      }
    },
    recordManualPayment(
      orderId: string,
      method: PaymentMethod,
      reference: string
    ) {
      this.ensureHydrated();
      this.orders = this.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              payment: {
                ...order.payment,
                method,
                reference,
                status: "paid",
              },
              status: "paid",
            }
          : order
      );
      this.persist();
    },
  },
});
