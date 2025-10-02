export type Theme = "light" | "dark"
export interface ProfessionalData {
    id: number;
    intro: string;
    language: string;
    yearsOfExp: number;
    numRating: number;
    avgRating: number;
    profession: {
        title: string;
    };
    profile: {
        firstName: string;
        lastName: string;
        totalJobsCompleted: number;
        avatar:string;
        userId:string;
        user: {
            location: {
                state: string;
                lga: string;
            };
            professionalReviews: Array<{
                id: number;
                rating: number;
                review: string;
                clientUser: {
                    profile: {
                        firstName: string;
                        lastName: string;
                    };
                };
            }>;
        };
        education: Array<{
            id: number;
            school: string;
            course: string;
        }>;
        certification: Array<{
            id: number;
            title: string;
            date: string;
        }>;
        portfolio: Array<{
            id: number;
            title: string;
            description: string;
        }>;
        experience: Array<{
            id: number;
            postHeld: string;
            workPlace: string;
            startDate: string;
            endDate: string;
        }>;
    };
}

enum JobMode {
    PHYSICAL = "PHYSICAL",
    VIRTUAL = "VIRTUAL"
}

enum PayStatus {
    PAID = "paid",
    UNPAID = "unpaid",
    PARTIAL = "partial"
}

enum PaidFor {
    BOTH = "both",
    WORKMANSHIP = "workmanship",
    MATERIALS = "materials"
}

enum JobStatus {
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

interface ProfessionalProfile {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
    professional: {
        id: number;
    };
}

interface Professional {
    id: string;
    email: string;
    phone: string;
    fcmToken: string | null;
    profile: ProfessionalProfile;
}

export interface JobProps{
    id: number;
    description: string;
    title: string;
    accepted: boolean;
    approved: boolean;
    state: string | null;
    lga: string | null;
    fullAddress: string;
    long: number | null;
    total: number | null;
    departureDaysCount: number;
    arrivalDaysCount: number;
    clientLocation: string | null;
    clientLocationArrival: string | null;
    clientLocationDeparture: string | null;
    isLocationMatch: boolean;
    paymentRef: string | null;
    workmanship: number | null;
    materials: number | null;
    numOfJobs: number | null;
    isMaterial: boolean | null;
    lan: string | null;
    durationUnit: string | null;
    reason: string | null;
    durationValue: number | null;
    clientId: string;
    professionalId: string;
    sectorId: string | null;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    userId: string | null;
    mode: JobMode | string;
    payStatus: PayStatus | string;
    paidFor: PaidFor | string;
    status: JobStatus | string;
    professional: Professional;
    material: Array<any>; // Replace 'any' with a more specific type if you know the structure
    
}

export interface JobMaterial {
    // Define properties if materials have specific structure
    id?: number;
    name?: string;
    quantity?: number;
    // Add other material properties as needed
  }
  
  export interface JobLatest {
    id: number;
    description: string;
    title: string;
    accepted: boolean;
    approved: boolean;
    mode: JobMode;
    state: string | null;
    lga: string | null;
    fullAddress: string;
    long: number | null;
    total: number | null;
    departureDaysCount: number;
    arrivalDaysCount: number;
    clientLocation: string | null;
    clientLocationArrival: string | null;
    clientLocationDeparture: string | null;
    isLocationMatch: boolean;
    payStatus: PayStatus
    paidFor:'workmanship' | 'materials' | 'both' | string;
    paymentRef: string | null;
    workmanship: number | null;
    materials: number | null;
    numOfJobs: number;
    isMaterial: boolean | null;
    lan: string | null;
    durationUnit: string | null;
    reason: string | null;
    durationValue: number | null;
    status: JobStatus
    clientId: string;
    professionalId: string;
    sectorId: number | null;
    createdAt: string;
    updatedAt: string;
    material: JobMaterial[];
  }

  interface ClientProfile {
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
    rate: number;
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
  
  interface ClientLocation {
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
  
  export interface ClientDetail {
    id: string;
    email: string;
    phone: string;
    status: 'ACTIVE' | 'INACTIVE' | string;
    role: 'client' | 'professional' | string;
    createdAt: string;
    updatedAt: string;
    profile: ClientProfile;
    location: ClientLocation;
  }

  interface ClientProfile {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
  }
  
  interface Client {
    id: string;
    email: string;
    phone: string;
    fcmToken: string;
    profile: ClientProfile;
  }
  export interface MyJob {
    id: number;
    description: string;
    title: string;
    accepted: boolean;
    approved: boolean;
    mode: 'PHYSICAL' | 'VIRTUAL' | string;
    state: string | null;
    lga: string | null;
    fullAddress: string;
    long: number | null;
    total: number | null;
    departureDaysCount: number;
    arrivalDaysCount: number;
    clientLocation: string | null;
    clientLocationArrival: string | null;
    clientLocationDeparture: string | null;
    isLocationMatch: boolean;
    payStatus: 'unpaid' | 'paid' | 'partial' | string;
    paidFor: 'workmanship' | 'materials' | 'both' | string;
    paymentRef: string | null;
    workmanship: number | null;
    materialsCost: number | null;
    numOfJobs: number;
    isMaterial: boolean | null;
    lan: string | null;
    durationUnit: string | null;
    reason: string | null;
    durationValue: number | null;
    status: JobStatus
    clientId: string;
    professionalId: string;
    sectorId: number | null;
    createdAt: string;
    updatedAt: string;
    client: Client;
    materials: JobMaterial[];
  }

  export interface Material {
    id: number;
    description: string;
    quantity: number;
    unit: string;
    price: number;
    subTotal: number;
  }
  
  export interface JobInvoice {
    id: number;
    title: string;
    description: string;
    mode: 'PHYSICAL' | 'VIRTUAL';
    fullAddress: string | null;
    state: string | null;
    lga: string | null;
    workmanship: number | null;
    materialsCost: number | null;
    payStatus: 'unpaid' | 'paid';
    durationUnit: string | null;
    durationValue: number | null;
    materials: Material[];
  }
  export interface Wallet {
    id: string;
    createdAt: string;
    currency: string;
    currentBalance: number;
    pin: string | null;
    previousBalance: number;
    status: string;
    updatedAt: string;
    userId: string;
  }

  export interface Message {
    from: any;
    to: any;
    text?: string;
    image?: any;
    room?: string;
    timestamp?: string;
    time?:string
    
  }

  type UserLocation = {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
    lga: string;
    state: string;
    zipcode: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
  
  type UserProfile = {
    id: number;
    avatar: string;
    birthDate: string | null;
    bvn: string | null;
    bvnVerified: boolean | null;
    count: number;
    createdAt: string;
    updatedAt: string;
    fcmToken: string;
    firstName: string;
    lastName: string;
    notified: boolean;
    position: string | null;
    rate: string;
    store: boolean;
    switch: boolean;
    totalDisputes: number;
    totalExpense: number;
    totalJobs: number;
    totalJobsApproved: number;
    totalJobsCanceled: number;
    totalJobsCompleted: number;
    totalJobsDeclined: number;
    totalJobsOngoing: number;
    totalJobsPending: number;
    totalReview: number;
    userId: string;
    verified: boolean;
  };
  
  export interface UserData{
    id: string;
    email: string;
    phone: string;
    agreed: boolean;
    createdAt: string;
    updatedAt: string;
    role: string;
    status: string;
    location: UserLocation;
    profile: UserProfile;
  };
  export interface PreviousChatData {
    agreed: boolean;
    createdAt: string;
    email: string;
    fcmToken: string | null;
    id: string;
    location: {
      address: string | null;
      createdAt: string;
      id: number;
      latitude: number;
      lga: string | null;
      longitude: number;
      state: string | null;
      updatedAt: string;
      userId: string;
      zipcode: string | null;
    };
    onlineUser: {
      createdAt: string;
      isOnline: boolean;
      lastActive: string;
      socketId: string;
      updatedAt: string;
      userId: string;
    } | null;
    phone: string;
    profile: {
      avatar: string;
      birthDate: string | null;
      bvn: string | null;
      bvnVerified: boolean | null;
      count: number;
      createdAt: string;
      fcmToken: string | null;
      firstName: string;
      id: number;
      lastName: string;
      notified: boolean;
      position: string | null;
      professional: Record<string, any>; // Update if structure is known
      rate: string;
      store: boolean;
      switch: boolean;
      totalDisputes: number;
      totalExpense: number;
      totalJobs: number;
      totalJobsApproved: number;
      totalJobsCanceled: number;
      totalJobsCompleted: number;
      totalJobsDeclined: number;
      totalJobsOngoing: number;
      totalJobsPending: number;
      totalReview: number;
      updatedAt: string;
      userId: string;
      verified: boolean;
    };
    role: string;
    status: string;
    updatedAt: string;
  }

  export interface BankRecipient {
    id: number;
    userId: string;
    name: string;
    number: string;
    bank: string;
    currency: string;
    recipientCode: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }

  export interface categoryProduct{
   
      id: number,
      name: string,
      description:string
  
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
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    images: string[]; // Assuming images is an array of image URL strings
    categoryId: number;
    quantity: number;
    price: string; // Can be changed to number if your API returns numeric price
    discount: number;
    userId: string;
    locationId: number;
    category: categoryProduct;
    location: Location;
  }


  export interface ApiResponse {
    status: boolean;
    message: string;
    data: Product;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    images: string[];
    categoryId: number;
    quantity: number;
    price: string;
    discount: number;
    userId: string;
    locationId: number;
    category: Category;
    location: Location;
    user: User;
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
  
  export interface User {
    id: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    agreed: boolean;
    createdAt: string;
    updatedAt: string;
    profile: UserProfile;
  }

  export interface DeliveryData {
    id: number;
    productTransactionId: number;
    status: string;
    cost: string;
    distance: number;
    weight: string;
    locationId: number;
    riderId: number | null;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
    dropoffLocation:{
      id: number;
  address: string | null;
  lga: string | null; // Local Government Area
  state: string | null;
  latitude: number;
  longitude: number;
  zipcode: string | null;
  userId: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
    }
    productTransaction: {
      id: number;
      productId: number;
      buyerId: string;
      sellerId: string;
      quantity: number;
      price: string;
      status: string;
      orderMethod: string;
      date: string; // ISO Date string
      createdAt: string; // ISO Date string
      updatedAt: string; // ISO Date string
      product: {
        id: number;
        name: string;
        description: string;
        images: string; // JSON string of array of URLs
        categoryId: number;
        weightPerUnit: number | null;
        quantity: number;
        price: string;
        discount: number;
        userId: string;
        locationId: number;
        pickupLocation: {
          latitude: number;
          longitude: number;
          
        };
        destinationLocation:{

        }
      };
    };
  };

  
  
  