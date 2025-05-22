// authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { useSecureAuth } from "hooks/useSecureAuth" // path relative to your slice

// Move SecureStore functions out of hook for thunk use
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  state: string;
  lga: string;
  address: string;
  verified: boolean;
  bvn?:string;
  bvnVerified?:boolean;
  rate:number;
  totalJobs: number;
  totalExpense: number;
  totalJobsDeclined: number;
  totalJobsPending:number;
  totalJobsOngoing: number;
  totalJobsCompleted: number;
  totalReview:number;
  totalJobsApproved: number;
  totalJobsCanceled: number;
  totalDisputes: number;
  // ...add more if needed
}

interface Wallet {
  id: string;
  currentBalance: number;
  currency: string;
  status: string;
}

interface AuthUser {
  id: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  profile: UserProfile;
  wallet: Wallet;
  createdAt: string;
  updatedAt: string;
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