import axios, { AxiosResponse } from 'axios';
import { 
  AUTH,
  API_BASE_URL
} from 'utilizes/endpoints';
import MockDataService from './mockDataService';
import NetworkService from './networkService';

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
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.SEND_OTP}`, data);
    return response.data;
  }).catch((error: any) => {
    const msg = error?.response?.data?.message || error?.message || 'Failed to send OTP';
    throw new Error(msg);
  });
};

export const verifyOtp = async (data: OtpData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.VERIFY_OTP}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(error?.response?.data?.message || 'OTP verification failed');
  });
};

export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(error?.response?.data?.message || 'User registration failed');
  });
};

export const registerArtisan = async (data: RegisterData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER_PROFESSIONAL}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(error?.response?.data?.message || 'Artisan registration failed');
  });
};

export const registerRider = async (data: RegisterData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER_RIDER}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(error?.response?.data?.message || 'Rider registration failed');
  });
};

export const registerCorporate = async (data: CorporateData): Promise<ApiResponse> => {
  return checkNetworkAndProceed(async () => {
    const response: AxiosResponse<ApiResponse> = await axios.post(`${API_BASE_URL}${AUTH.REGISTER_CORPERATE}`, data);
    return response.data;
  }).catch((error: any) => {
    throw new Error(error?.response?.data?.message || 'Corporate registration failed');
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

