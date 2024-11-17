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
    description: string;
    benefits: string[];
    price: number;
    unit: string,
  }
  
  export interface Post {
    id: number;
    title: string;
    category: string;
    writer: string;
    date: string;
    image: string;
    content: string;
  }