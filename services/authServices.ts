import axios, { AxiosResponse } from 'axios';
import {
  AUTH,
  API_BASE_URL,
  deleteUserUrl,
} from 'utilizes/endpoints';
import MockDataService from './mockDataService';
import NetworkService from './networkService';
import { store } from 'redux/store';

// Type definitions
interface LoginData {
  email: string;
  password: string;
}

interface OtpData {
  email?: string;
  phone?: string;
  otp?: string;
  emailCode?: {
    email: string;
    code: string;
  };
  smsCode?: {
    phone: string;
    code: string;
  };
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface CorporateData extends RegisterData {
  companyName: string;
  businessType: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  status?: boolean;
  data: T;
  message?: string;
}

// Extracts a user-friendly message from a registration API error
const extractRegError = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;

  // Zod validation issues: { error: "Invalid input", issues: { field: { _errors: ["..."] } } }
  if (data.issues) {
    const keys = Object.keys(data.issues).filter((k) => k !== '_errors');
    for (const key of keys) {
      if (data.issues[key]?._errors?.[0]) return data.issues[key]._errors[0];
    }
    if (data.issues._errors?.[0]) return data.issues._errors[0];
  }

  // Standard message field (ignore backend's useless literal 'error')
  if (data.message && data.message !== 'error') return data.message;
  if (data.error && data.error !== 'error') return data.error;

  return error?.message || fallback;
};

// Helper function to check network status before making requests
const checkNetworkAndProceed = async (apiCall: () => Promise<any>) => {
  const networkService = NetworkService.getInstance();
  const status = networkService.getStatus();
  
  if (!status.isOnline) {
    throw new Error('No internet connection. Please check your network settings.');
  }
  
  if (!status.serverReachable) {
    throw new Error('Server is currently unavailable. Please try again later.');
  }
  
  // Force a fresh check before proceeding
  await networkService.forceCheck();
  const freshStatus = networkService.getStatus();
  
  if (!freshStatus.serverReachable) {
    throw new Error('Server is currently unavailable. Please try again later.');
  }
  
  return apiCall();
};

// API functions with proper typing and error handling
export const loginUser = async (data: LoginData): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.LOGIN}`, data);
    return response.data;
  } catch (error: any) {
    // If server is unavailable, fall back to mock data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('Server unavailable, using mock data for login');
      return await MockDataService.login(data.email, data.password);
    }
    throw error;
  }
};

export const sendOtp = async (data: { email?: string; phone?: string; type?: string; reason?: string }): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    console.log('=== SEND OTP VERIFICATION ===');
    console.log('Email:', data.email);
    console.log('Phone:', data.phone);
    console.log('Type:', data.type);
    console.log('Reason:', data.reason);
    
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.SEND_OTP}`, data);
    
    console.log('SEND OTP SUCCESS:', response.data);
    return response.data;
  }).catch((error: any) => {
    console.log('=== SEND OTP ERROR ===');
    console.log('Email:', data.email);
    console.log('Phone:', data.phone);
    console.log('Type:', data.type);
    console.log('Reason:', data.reason);
    console.log('Error Code:', error?.code);
    console.log('Error Status:', error?.response?.status);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.response?.data?.message || error?.message);
    
    const msg = error?.response?.data?.message || error?.message || 'Failed to send OTP';
    throw new Error(msg);
  });
};

export const verifyOtp = async (data: OtpData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    console.log('=== VERIFY OTP VERIFICATION ===');
    console.log('OTP Data:', JSON.stringify(data, null, 2));
    
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.VERIFY_OTP}`, data);
    
    console.log('VERIFY OTP SUCCESS:', response.data);
    return response.data;
  }).catch((error: any) => {
    console.log('=== VERIFY OTP ERROR ===');
    console.log('OTP Data:', JSON.stringify(data, null, 2));
    console.log('Error Code:', error?.code);
    console.log('Error Status:', error?.response?.status);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.response?.data?.message || error?.message);
    
    throw new Error(error?.response?.data?.message || 'OTP verification failed');
  });
};

export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(extractRegError(error, 'Registration failed. Please try again.'));
  });
};

export const registerArtisan = async (data: RegisterData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER_PROFESSIONAL}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(extractRegError(error, 'Registration failed. Please try again.'));
  });
};

export const registerRider = async (data: RegisterData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER_RIDER}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(extractRegError(error, 'Registration failed. Please try again.'));
  });
};

export const registerCorporate = async (data: CorporateData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER_CORPERATE}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(extractRegError(error, 'Registration failed. Please try again.'));
  });
};

export const forgetUser = async (data: { email: string }): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.FORGOT_PASSWORD}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Password reset failed');
  }
};

export const deleteAccountFn = async (): Promise<ApiResponse> => {
  const token = store.getState().auth?.token;
  try {
    const response: AxiosResponse<ApiResponse> = await axios.delete(deleteUserUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Account deletion failed');
  }
};

