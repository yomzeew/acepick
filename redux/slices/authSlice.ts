import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, sendOtp, verifyOtp, registerUser, registerArtisan, registerRider, registerCorporate, forgetUser } from '../../services/authServices';
import { switchRoleFn } from '../../services/roleSwitchService';
import CleanupService from '../../services/cleanupService';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_KEY  = 'userData';

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: any;
  wallet?: any;
  location?: any;
  fcmToken?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  registrationData: Record<string, any>;
  cooperationData: Record<string, any>;
  activePage: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  emailVerified: false,
  phoneVerified: false,
  registrationData: {},
  cooperationData: {},
  activePage: "Home",
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendOtpAsync = createAsyncThunk(
  'auth/sendOtp',
  async (data: { email?: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await sendOtp(data);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to send OTP');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOtpAsync = createAsyncThunk(
  'auth/verifyOtp',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await verifyOtp(data);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'OTP verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUserAsync = createAsyncThunk(
  'auth/registerUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerArtisanAsync = createAsyncThunk(
  'auth/registerArtisan',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await registerArtisan(userData);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Artisan registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerRiderAsync = createAsyncThunk(
  'auth/registerRider',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await registerRider(userData);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Rider registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerCorporateAsync = createAsyncThunk(
  'auth/registerCorporate',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await registerCorporate(userData);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Corporate registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPasswordAsync = createAsyncThunk(
  'auth/forgotPassword',
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response = await forgetUser(data);
      if (response.status || response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Password reset failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const switchRoleAsync = createAsyncThunk(
  'auth/switchRole',
  async (role: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      if (!token) throw new Error('No auth token found — please log in again');

      const data = await switchRoleFn(role, token); // { user, token }

      // Persist new credentials immediately so the app survives a reload
      await SecureStore.setItemAsync(USER_KEY,  JSON.stringify(data.user));
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);

      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to switch role';
      return rejectWithValue(msg);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await CleanupService.performLogoutCleanup();
      return true;
    } catch (error: any) {
      console.error('Logout cleanup error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Synchronous logout - state clearing only
      // For full cleanup, use logoutAsync thunk
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.emailVerified = false;
      state.phoneVerified = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;
    },
    setFcmToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.fcmToken = action.payload;
      }
    },
    updateUserFromDashboard: (state, action: PayloadAction<{ profile?: any; wallet?: any; professional?: any; location?: any }>) => {
      if (state.user) {
        const { profile, wallet, professional, location } = action.payload;
        if (profile) state.user.profile = { ...state.user.profile, ...profile };
        if (wallet) state.user.wallet = wallet;
        if (professional && state.user.profile) {
          state.user.profile.professional = professional;
        }
        if (location) state.user.location = { ...state.user.location, ...location };
      }
    },
    setRegistrationData: (state, action: PayloadAction<Record<string, any>>) => {
      state.registrationData = { ...state.registrationData, ...action.payload };
    },
    setCooperationData: (state, action: PayloadAction<Record<string, any>>) => {
      state.cooperationData = { ...state.cooperationData, ...action.payload };
    },
    clearRegistrationData: (state) => {
      state.registrationData = {};
      state.cooperationData = {};
    },
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send OTP
    builder
      .addCase(sendOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtpAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(sendOtpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpVerified = true;
        state.emailVerified = action.payload?.emailVerified ?? true;
        state.phoneVerified = action.payload?.smsVerified ?? false;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register User
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register Artisan
    builder
      .addCase(registerArtisanAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerArtisanAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerArtisanAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register Rider
    builder
      .addCase(registerRiderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerRiderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerRiderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register Corporate
    builder
      .addCase(registerCorporateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCorporateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerCorporateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Switch Role
    builder
      .addCase(switchRoleAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(switchRoleAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(switchRoleAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.otpSent = false;
        state.otpVerified = false;
        state.emailVerified = false;
        state.phoneVerified = false;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear state even if cleanup fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setToken, setUser, resetOtpState, setFcmToken, updateUserFromDashboard, setRegistrationData, setCooperationData, clearRegistrationData, setActivePage } = authSlice.actions;
export default authSlice.reducer;
