export interface ContactListResponse {
    status: boolean;
    message: string;
    data: ContactUser[];
  }
  
  export interface ContactUser {
    id: string;
    email: string;
    fcmToken: string;
    phone: string;
    status: string;
    role: string;
    agreed: boolean;
    createdAt: string;
    updatedAt: string;
    profile: UserProfile;
    location: UserLocation;
    onlineUser:OnlineUser;
  }
  
  export interface UserProfile {
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
    professional: Professional;
  }
  
  export interface Professional {
    id: number;
    file: string | null;
    intro: string | null;
    chargeFrom: number | null;
    language: string;
    available: boolean;
    workType: string;
    totalEarning: number;
    completedAmount: string;
    pendingAmount: number | null;
    rejectedAmount: string;
    availableWithdrawalAmount: string;
    regNum: string | null;
    yearsOfExp: number | null;
    online: boolean;
    profileId: number;
    professionId: number;
    createdAt: string;
    updatedAt: string;
    profession: Profession;
  }
  
  export interface Profession {
    id: number;
    title: string;
    image: string;
    sectorId: number;
  }
  
  export interface UserLocation {
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
  export interface OnlineUser {
    userId: string;
    socketId: string;
    lastActive: string;  // ISO date string
    isOnline: boolean;
    createdAt: string;   // ISO date string
    updatedAt: string;   // ISO date string
  }
  