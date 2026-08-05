export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
  variantLabel?: string;
}
export interface Product {
  id: string;
  name: string;
  slug?: string;
  brand?: string;
  image: string;
  images?: string[];
  category: string;
  description: string;
  benefits: string[];
  price: number;
  comparePrice?: number;
  unit: string;
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
  sku?: string;
  metaTitle?: string;
  metaDescription?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  label: string;
  weight: number;
  unit: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}
export interface ProductInput extends Omit<Product, "id"> {}

export interface Post {
  id: string;
  title: string;
  category: string;
  writer: string;
  date: string;
  image: string;
  content: string;
  slug?: string;
  rawSlug?: string;
  excerpt?: string;
  views?: number;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type PaymentMethod = "bkash" | "sslcommerz" | "cod";

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  country: string;
  phone: string;
}

export interface PaymentSummary {
  method: PaymentMethod;
  status: "pending" | "processing" | "paid" | "failed";
  reference?: string;
  provider?: string;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shipping: ShippingAddress;
  payment: PaymentSummary;
  customerEmail?: string;
}