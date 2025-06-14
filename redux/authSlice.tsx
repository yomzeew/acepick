// authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { useSecureAuth } from "hooks/useSecureAuth" // path relative to your slice

// Move SecureStore functions out of hook for thunk use
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

interface Profession {
  id: number;
  title?: string;
  // Add other profession properties if available
}

interface Professional {
  id: number;
  available: boolean;
  availableWithdrawalAmount: number;
  chargeFrom: number | null;
  completedAmount: number;
  createdAt: string;
  file: string | null;
  intro: string | null;
  language: string;
  online: boolean;
  pendingAmount: number;
  profession: Profession;
  professionId: number;
  profileId: number;
  regNum: string | null;
  rejectedAmount: number;
  totalEarning: number;
  updatedAt: string;
  workType: string;
  yearsOfExp: number | null;
}

interface UserProfile {
  id: number;
  avatar: string;
  birthDate: string | null;
  bvn: string | null;
  bvnVerified: boolean | null;
  count: number;
  createdAt: string;
  fcmToken: string;
  firstName: string;
  lastName: string;
  notified: boolean;
  position: string | null;
  professional: Professional;
  rate: number;
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
}

interface Location {
  id: number;
  address: string;
  createdAt: string;
  latitude: number;
  lga: string;
  longitude: number;
  state: string;
  updatedAt: string;
  userId: string;
  zipcode: string | null;
}

interface Wallet {
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

interface ProfessionalReview {
  // Define properties based on your review structure
  id?: number;
  // ... other review fields
}

interface AuthUser {
  id: string;
  createdAt: string;
  email: string;
  fcmToken: string;
  phone: string;
  role: string;
  status: string;
  updatedAt: string;
  location: Location;
  professionalReviews: ProfessionalReview[];
  profile: UserProfile;
  wallet: Wallet;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  activePage: string;
  loading: boolean;
}


const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  activePage: 'Home',
  loading: true,
};

// Async thunk to load persisted login
export const loadAuthFromSecureStore = createAsyncThunk('auth/load', async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const userData = await SecureStore.getItemAsync(USER_KEY);
  if (token && userData) {
    return {
      token,
      user: JSON.parse(userData),
    };
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
 
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      SecureStore.deleteItemAsync(TOKEN_KEY);
      SecureStore.deleteItemAsync(USER_KEY);
    },
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadAuthFromSecureStore.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    });
    builder.addCase(loadAuthFromSecureStore.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { login, logout, setActivePage } = authSlice.actions;
export default authSlice.reducer;