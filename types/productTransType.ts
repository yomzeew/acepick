export interface ProductTransaction {
    id: number;
    productId: number;
    buyerId: string;
    sellerId: string;
    quantity: number;
    price: string;
    status: "ordered" | "pending" | "delivered" | "cancelled"; // extend as needed
    orderMethod: "delivery" | "pickup"; // extend as needed
    date: string; // ISO timestamp
    createdAt: string;
    updatedAt: string;
    product: Product;
    order: Order;
    buyer: Buyer;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    images: string[];
    categoryId: number;
    weightPerUnit: number | null;
    quantity: number;
    price: string;
    discount: number;
    userId: string;
    locationId: number;
  }
  
  export interface Order {
    id: number;
    productTransactionId: number;
    status: "paid" | "unpaid" | "cancelled" | "refunded"; // extend as needed
    cost: string;
    distance: string;
    weight: string;
    locationId: number;
    riderId: string | null;
    createdAt: string;
    updatedAt: string;
    rider: Rider | null;
  }
  
  export interface Rider {
    id: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    profile: Profile;
  }
  
  export interface Buyer {
    id: string;
    email: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE";
    role: "client" | "admin" | "seller"; // extend as needed
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
  