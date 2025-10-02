import axios, { AxiosResponse } from 'axios';
import { 
  corporateUrl, 
  forgotpassword, 
  loginUrl, 
  registerUrl, 
  registerUrlArtisan, 
  sendOtpUrl, 
  verifyOtpUrl 
} from 'utilizes/endpoints';

// Type definitions
interface LoginData {
  email: string;
  password: string;
}

interface OtpData {
  email?: string;
  phone?: string;
  otp: string;
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
  data: T;
  message?: string;
}

// API functions with proper typing and error handling
export const loginUser = async (data: LoginData): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(loginUrl, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Login failed');
  }
};

export const sendOtp = async (data: { email?: string; phone?: string }): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(sendOtpUrl, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to send OTP');
  }
};

export const verifyOtp = async (data: OtpData): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(verifyOtpUrl, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'OTP verification failed');
  }
};

export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(registerUrl, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'User registration failed');
  }
};

export const registerArtisan = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(registerUrlArtisan, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Artisan registration failed');
  }
};

export const registerCorporate = async (data: CorporateData): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(corporateUrl, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Corporate registration failed');
  }
};

export const forgetUser = async (data: { email: string }): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(forgotpassword, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Password reset failed');
  }
};

