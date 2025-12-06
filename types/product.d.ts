export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
}
export interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  description: string;
  benefits: string[];
  price: number;
  unit: string;
}

export interface ProductInput extends Omit<Product, "id"> {}

export interface Post {
  id: number;
  title: string;
  category: string;
  writer: string;
  date: string;
  image: string;
  content: string;
  slug?: string;
}
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export type PaymentMethod = "card" | "bkash" | "nagad" | "cod";

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
