// User Profile
interface UserProfile {
    id: number;
    avatar: string;
    firstName: string;
    lastName: string;
  }
  
  // User
  interface User {
    id: string;
    email: string;
    profile: UserProfile;
  }
  
  // Location
  interface Location {
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
  
  // Product
  interface Product {
    id: number;
    name: string;
    description: string;
    images: string; // raw string from API (can parse to string[] later)
    categoryId: number;
    weightPerUnit: number | null;
    quantity: number;
    price: string;
    discount: number;
    userId: string;
    locationId: number;
    pickupLocation: Location;
  }
  
  // Product Transaction
  interface ProductTransaction {
    id: number;
    productId: number;
    buyerId: string;
    sellerId: string;
    quantity: number;
    price: string;
    status: string;
    orderMethod: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    product: Product;
    seller: User;
    buyer: User;
  }
  
  // Delivery Item
 export interface Delivery {
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
    dropoffLocation: Location;
    productTransaction: ProductTransaction;
  }
  
  // API Response
  export interface ApiResponse {
    status: boolean;
    message: string;
    data: Delivery[];
  }
  