// ── Shared types ────────────────────────────────────────────────────

export interface DashboardProfile {
  firstName: string;
  lastName: string;
  avatar: string | null;
  totalJobs: number;
  totalJobsCompleted: number;
  totalJobsPending?: number;
  totalJobsOngoing?: number;
  totalJobsDeclined?: number;
  totalJobsCanceled?: number;
  totalJobsApproved?: number;
  totalDisputes?: number;
  totalExpense: number;
  totalReview: number;
  rate?: number | null;
}

export interface DashboardWallet {
  currentBalance: number;
  previousBalance: number;
  currency: string;
  status: string;
}

export interface DashboardTransaction {
  id: number | string;
  amount: number;
  type: "credit" | "debit";
  status: string;
  description: string | null;
  channel?: string | null;
  currency: string;
  createdAt: string;
}

export interface UserSnippet {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  } | null;
}

// ── Client Dashboard ────────────────────────────────────────────────

export interface JobSummary {
  total: number;
  pending: number;
  ongoing: number;
  completed: number;
  approved: number;
  cancelled: number;
  disputed: number;
  declined?: number;
}

export interface ClientRecentJob {
  id: number;
  title: string | null;
  description: string | null;
  status: string;
  payStatus: string | null;
  total: number | null;
  mode: string | null;
  createdAt: string;
  professional: UserSnippet;
}

export interface ClientRecentOrder {
  id: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    image: string | null;
  } | null;
}

export interface ClientDashboardData {
  profile: DashboardProfile;
  wallet: DashboardWallet | null;
  jobSummary: JobSummary;
  recentJobs: ClientRecentJob[];
  recentTransactions: DashboardTransaction[];
  recentOrders: ClientRecentOrder[];
}

// ── Professional Dashboard ──────────────────────────────────────────

export interface ProfessionalSkillItem {
  id: number;
  proficiency: string | null;
  yearsOfExp: number | null;
  skill: {
    id: number;
    name: string;
    category: string | null;
  };
}

export interface ProfessionalInfo {
  id: number;
  totalEarning: number;
  completedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  availableWithdrawalAmount: number;
  chargeFrom: number | null;
  yearsOfExp: number | null;
  available: boolean | null;
  workType: string;
  intro: string | null;
  online: boolean;
  profession: {
    id: number;
    title: string;
    sector: { id: number; title: string };
  };
  professionalSkills: ProfessionalSkillItem[];
}

export interface ProfessionalRecentJob {
  id: number;
  title: string | null;
  description: string | null;
  status: string;
  payStatus: string | null;
  total: number | null;
  mode: string | null;
  workmanship: number | null;
  materialsCost: number | null;
  createdAt: string;
  client: UserSnippet;
}

export interface RatingSummary {
  average: number;
  total: number;
}

export interface RecentReview {
  id: number;
  comment: string;
  createdAt: string;
  client: {
    profile: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    } | null;
  };
}

export interface ProfessionalDashboardData {
  profile: DashboardProfile;
  wallet: DashboardWallet | null;
  professional: ProfessionalInfo | null;
  jobSummary: JobSummary;
  recentJobs: ProfessionalRecentJob[];
  ongoingJobs: ProfessionalRecentJob[];
  recentTransactions: DashboardTransaction[];
  ratings: RatingSummary;
  recentReviews: RecentReview[];
  skills: ProfessionalSkillItem[];
}

// ── Delivery Dashboard ──────────────────────────────────────────────

export interface RiderInfo {
  id: number;
  vehicleType: string | null;
  licenseNumber: string;
  status: string;
}

export interface OrderSummary {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  disputed: number;
  availableNearby: number;
}

export interface DeliveryOrder {
  id: number;
  status: string;
  cost: number;
  deliveryFee: number | null;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  distance: number;
  createdAt: string;
  productTransaction?: {
    product: { name: string; images: string | null } | null;
    buyer?: {
      profile: { firstName: string; lastName: string } | null;
    };
  } | null;
}

export interface DeliveryEarnings {
  completedAmount: number;
  pendingAmount: number;
  availableWithdrawalAmount: number;
  rejectedAmount: number;
  totalEarning: number;
}

export interface DeliveryDashboardData {
  profile: DashboardProfile;
  wallet: DashboardWallet | null;
  rider: RiderInfo | null;
  professional: DeliveryEarnings | null;
  orderSummary: OrderSummary;
  pendingDeliveries: DeliveryOrder[];
  activeOrders: DeliveryOrder[];
  recentOrders: DeliveryOrder[];
  recentTransactions: DashboardTransaction[];
  ratings: RatingSummary;
}
