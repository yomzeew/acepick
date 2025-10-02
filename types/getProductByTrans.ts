export interface ProductTransactionResponse {
    status: boolean;
    message: string;
    data: ProductTransactionDetail;
  }
  
  export interface ProductTransactionDetail {
    id: number;
    productId: number;
    buyerId: string;
    sellerId: string;
    quantity: number;
    price: string;
    status: "pending" | "ordered" | "delivered" | "picked_up" | string;
    orderMethod: "delivery" | "pickup" | string;
    date: string;
    createdAt: string;
    updatedAt: string;
    product: Product;
    order: Order;
    transaction: Transaction;
    buyer: User;
    seller: User;
  }
  
  /* ---------- Product ---------- */
  export interface Product {
    id: number;
    name: string;
    description: string;
    images: string; // ⚠️ JSON string array → parse to string[]
    categoryId: number;
    weightPerUnit: number | null;
    quantity: number;
    price: string;
    discount: number;
    userId: string;
    locationId: number;
    category: Category;
    pickupLocation: Location;
  }
  
  export interface Category {
    id: number;
    name: string;
    description: string;
  }
  
  export interface Location {
    id: number;
    address: string;
    lga: string;
    state: string;
    latitude: number;
    longitude: number;
    zipcode: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /* ---------- Order ---------- */
  export interface Order {
    id: number;
    productTransactionId: number;
    status: string;
    cost: string;
    distance: string;
    weight: string;
    locationId: number;
    riderId: string;
    createdAt: string;
    updatedAt: string;
    rider: Rider;
    dropoffLocation: Location;
  }
  
  export interface Rider {
    id: string;
    email: string;
    phone: string;
    status: string;
    role: "delivery" | string;
    agreed: boolean;
    createdAt: string;
    updatedAt: string;
    profile: Profile;
  }
  
  /* ---------- Transaction ---------- */
  export interface Transaction {
    id: number;
    amount: string;
    type: "credit" | "debit" | string;
    status: "pending" | "completed" | "failed" | string;
    channel: string | null;
    currency: string;
    timestamp: string;
    description: string;
    reference: string;
    jobId: number | null;
    productTransactionId: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /* ---------- User ---------- */
  export interface User {
    id: string;
    email: string;
    phone: string;
    status: string;
    role: "client" | "professional" | "delivery" | string;
    agreed: boolean;
    createdAt: string;
    updatedAt: string;
    profile: Profile;
  }
  
  export interface Profile {
    id: number;
    avatar: string;
    firstName: string;
    lastName: string;
  }
  