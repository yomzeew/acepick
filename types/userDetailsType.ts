// Sector
interface Sector {
  id: number;
  title: string;
  image: string;
}

// Profession
interface Profession {
  id: number;
  title: string;
  image: string;
  sectorId: number;
  sector: Sector;
}

// Professional
interface Professional {
  id: number;
  file: string | null;
  intro: string | null;
  chargeFrom: string | null;
  language: string;
  available: boolean;
  workType: string;
  totalEarning: number;
  completedAmount: string;
  pendingAmount: string | null;
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

// Education
interface Education {
  id: number;
  school: string;
  degreeType: string;
  course: string;
  startDate: string;
  gradDate: string;
  isCurrent: boolean;
  profileId: number;
  createdAt: string;
  updatedAt: string;
}

// Wallet
interface Wallet {
  id: number;
  userId: string;
  previousBalance: string;
  currentBalance: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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

// User
interface User {
  id: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  agreed: boolean;
  createdAt: string;
  updatedAt: string;
  location: Location;
  wallet: Wallet;
  rider: unknown | null;
}

// Profile
export interface Profile {
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
  user: User;
  professional: Professional;
  cooperation: unknown | null;
  education: Education[];
  certification: any[]; // refine if schema is known
  experience: any[];    // refine if schema is known
  portfolio: any[];     // refine if schema is known
}

// API Response
interface ApiResponse {
  status: boolean;
  message: string;
  data: Profile;
}
