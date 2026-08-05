import { defineStore } from "pinia";
import type {
  Brand,
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
  brands: Brand[];
  faqs: Faq[];
  orders: OrderRecord[];
  nextProductId: number;
  useApi?: boolean;
};

interface CatalogState extends CatalogSnapshot {
  hydrated: boolean;
  useApi: boolean;
  loading: boolean;
  hydratePromise: Promise<void> | null;
}

const STORAGE_KEY = "nutrizaria.catalog.v1";
const isClient = typeof window !== "undefined";

const clone = <T>(payload: T): T => JSON.parse(JSON.stringify(payload));

const slugify = (str: string): string =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

const normalizeProduct = (p: Product): Product => ({
  ...p,
  slug: p.slug || slugify(p.name),
});

const readSnapshotFromStorage = (): CatalogSnapshot | null => {
  if (!isClient) return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
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

const mapUrl = (u: string) => {
  const s = String(u).trim();
  return /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
};

export const useCatalogStore = defineStore("catalog", {
  state: (): CatalogState => ({
    products: [],
    categories: [],
    brands: [],
    faqs: [],
    orders: [],
    nextProductId: 1,
    hydrated: false,
    useApi: false,
    loading: false,
    hydratePromise: null,
  }),
  getters: {
    productById: (state) => (id: string | number) =>
      state.products.find((product) => String(product.id) === String(id)),
    productBySlug: (state) => (slug: string) =>
      state.products.find((product) => product.slug === slug) ||
      state.products.find((product) => String(product.id) === slug),
    productsByCategory: (state) => (slug: string) =>
      state.products.filter((product) => product.category === slug),
    productsByBrand: (state) => (slug: string) =>
      state.products.filter((product) => product.brand === slug),
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
    async hydrate() {
      if (this.hydrated) return;
      if (this.hydratePromise) return this.hydratePromise;

      const nuxtApp = useNuxtApp();

      if (import.meta.client && nuxtApp.payload?.catalog) {
        const snap = nuxtApp.payload.catalog as CatalogSnapshot;
        this.products = clone(snap.products).map(normalizeProduct);
        this.categories = clone(snap.categories);
        this.brands = clone(snap.brands || []);
        this.faqs = clone(snap.faqs);
        this.useApi = snap.useApi ?? false;
        this.hydrated = true;
        return;
      }

      this.loading = true;

      this.hydratePromise = (async () => {
        try {
          const config = useRuntimeConfig();
          const apiBase = config.public.apiBase;
          if (apiBase) {
            const [productsRes, categoriesRes, brandsRes, faqsRes] = await Promise.allSettled([
              $fetch(`${apiBase}/products?limit=200`),
              $fetch(`${apiBase}/categories`),
              $fetch(`${apiBase}/brands`),
              $fetch(`${apiBase}/faqs`),
            ]);

            if (productsRes.status === "fulfilled" && productsRes.value?.data?.items) {
              this.products = productsRes.value.data.items.map((p: any) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                brand: p.brand?.slug || p.brand || '',
                image: p.image ? mapUrl(p.image) : p.image,
                category: p.category?.slug || p.category,
                description: p.description,
                benefits: p.benefits || [],
                price: p.price,
                unit: p.unit,
                isActive: p.isActive,
                isFeatured: p.isFeatured,
                stock: p.stock,
                comparePrice: p.comparePrice,
                images: p.images ? p.images.map((u: string) => mapUrl(u)) : p.images,
                sku: p.sku,
                variants: p.variants?.map((v: any) => ({
                  id: v.id,
                  label: v.label,
                  weight: v.weight,
                  unit: v.unit,
                  price: v.price,
                  comparePrice: v.comparePrice,
                  stock: v.stock,
                  sku: v.sku,
                  image: v.image ? mapUrl(v.image) : v.image,
                  isActive: v.isActive,
                  sortOrder: v.sortOrder,
                })) || [],
              }));
              this.useApi = true;
            }

            if (categoriesRes.status === "fulfilled" && categoriesRes.value?.data) {
              this.categories = categoriesRes.value.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                image: c.image ? mapUrl(c.image) : c.image,
                description: c.description,
                isActive: c.isActive,
                sortOrder: c.sortOrder,
              }));
            }

            if (brandsRes.status === "fulfilled" && brandsRes.value?.data) {
              this.brands = brandsRes.value.data.map((b: any) => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
                image: b.image ? mapUrl(b.image) : b.image,
                description: b.description,
                isActive: b.isActive,
                sortOrder: b.sortOrder,
              }));
            }

            if (faqsRes.status === "fulfilled" && faqsRes.value?.data) {
              this.faqs = faqsRes.value.data.map((f: any) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
                sortOrder: f.sortOrder,
                isActive: f.isActive,
              }));
            }
          }
        } catch (error) {
          console.warn("[catalog] API unavailable");
        } finally {
          this.loading = false;
          this.hydrated = true;
          this.hydratePromise = null;
          if (import.meta.server) {
            nuxtApp.payload.catalog = {
              products: this.products,
              categories: this.categories,
              brands: this.brands,
              faqs: this.faqs,
              useApi: this.useApi,
            };
          }
        }
      })();

      return this.hydratePromise;
    },

    applySnapshot(snapshot: CatalogSnapshot) {
      this.products = clone(snapshot.products).map(normalizeProduct);
      this.categories = clone(snapshot.categories);
      this.brands = clone(snapshot.brands || []);
      this.faqs = clone(snapshot.faqs);
      this.orders = clone(snapshot.orders);
      this.nextProductId = snapshot.nextProductId;
      this.persist();
    },

    persist() {
      const snapshot: CatalogSnapshot = {
        products: this.products,
        categories: this.categories,
        brands: this.brands,
        faqs: this.faqs,
        orders: this.orders,
        nextProductId: this.nextProductId,
      };
      writeSnapshotToStorage(snapshot);
    },

    ensureHydrated() {
      if (!this.hydrated) {
        return this.hydrate();
      }
    },

    async addProduct(payload: ProductInput) {
      this.ensureHydrated();
      if (this.useApi) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const token = useCookie("auth_token");
        const created = await $fetch(`${apiBase}/admin/products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token.value}` },
          body: payload,
        });
        this.products = [created, ...this.products];
        return created;
      }
      const product: Product = {
        ...payload,
        id: this.nextProductId++,
        slug: payload.slug || slugify(payload.name),
      };
      this.products = [product, ...this.products];
      this.persist();
      return product;
    },

    async updateProduct(updatedProduct: Product) {
      this.ensureHydrated();
      if (this.useApi) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const token = useCookie("auth_token");
        const updated = await $fetch(`${apiBase}/admin/products/${updatedProduct.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token.value}` },
          body: updatedProduct,
        });
        this.products = this.products.map((product) =>
          String(product.id) === String(updatedProduct.id) ? { ...updated } : product
        );
        return updated;
      }
      this.products = this.products.map((product) =>
        String(product.id) === String(updatedProduct.id) ? { ...updatedProduct } : product
      );
      this.persist();
    },

    async deleteProduct(productId: string | number) {
      this.ensureHydrated();
      if (this.useApi) {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const token = useCookie("auth_token");
        await $fetch(`${config.public.apiBase}/admin/products/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token.value}` },
        });
      }
      this.products = this.products.filter(
        (product) => String(product.id) !== String(productId)
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
          faqs: snapshot.faqs ?? [],
          orders: snapshot.orders ?? [],
          nextProductId:
            snapshot.nextProductId ??
            snapshot.products.reduce(
              (max: number, product: Product) => Math.max(max, Number(product.id) || 0),
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