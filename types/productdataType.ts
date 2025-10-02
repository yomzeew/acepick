interface ApiResponse {
    status: boolean;
    message: string;
    data: ProductData;
  }
  
  export interface ProductData {
    id: number;
    name: string;
    description: string;
    images: string[];
    categoryId: number;
    weightPerUnit: number | null;
    quantity: number;
    price: number;
    discount: number;
    userId: string;
    locationId: number;
    category: Category;
    pickupLocation: PickupLocation;
    user: User;
  }
  
  interface Category {
    id: number;
    name: string;
    description: string;
  }
  
  interface PickupLocation {
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
  
  interface User {
    id: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    agreed: boolean;
    createdAt: string;
    updatedAt: string;
    profile: Profile;
  }
  
  interface Profile {
    id: number;
    firstName: string;
    lastName: string;
    fcmToken: string;
    avatar: string;
    birthDate: string | null;
    verified: boolean;
    notified: boolean;
    totalJobs: number;
    totalExpense: number;
    rate: string;
    totalJobsDeclined: number;
    totalJobsPending: number;
    count: number;
    totalJobsOngoing: number;
    totalJobsCompleted: number;
    totalReview: number;
    totalJobsApproved: number;
    totalJobsCanceled: number;
    totalDisputes: number;
    bvn: string | null;
    bvnVerified: boolean | null;
    switch: boolean;
    store: boolean;
    position: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }