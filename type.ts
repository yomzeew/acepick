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