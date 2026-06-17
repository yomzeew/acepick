import axios from 'axios';
import { API_BASE_URL, BVN_VERIFY, BVN_STATUS } from 'utilizes/endpoints';
import { store, RootState } from '../redux/store';

export interface BVNVerificationRequest {
  bvn: string;
  dateOfBirth: string; // format: dd-MMM-yyyy e.g. "27-Apr-1993"
}

export interface BVNVerificationResponse {
  message: string;
  isVerified: boolean;
  verification: {
    id: number;
    bvn: string;
    isVerified: boolean;
    attempts: number;
    lastAttempt: string;
    createdAt: string;
  };
  details: {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
      bvn: string;
      name: {
        matchStatus: 'FULL_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH';
        matchPercentage: number;
      };
      dateOfBirth: 'FULL_MATCH' | 'NO_MATCH';
      mobileNo: 'FULL_MATCH' | 'NO_MATCH';
    };
  };
  matchDetails: {
    name: {
      status: 'FULL_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH';
      percentage: number;
      isMatch: boolean;
    };
    dateOfBirth: {
      status: 'FULL_MATCH' | 'NO_MATCH';
      isMatch: boolean;
    };
    mobileNo: {
      status: 'FULL_MATCH' | 'NO_MATCH';
      isMatch: boolean;
    };
  };
}

export interface BVNStatusResponse {
  isVerified: boolean;
  verification?: {
    id: number;
    bvn: string;
    isVerified: boolean;
    attempts: number;
    lastAttempt: string;
    createdAt: string;
  };
  message?: string;
}

// Helper function to get auth token from Redux
const getAuthToken = (): string => {
  const state = store.getState() as RootState;
  const token = state.auth.token;
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  
  return token;
};

// Verify BVN
export const verifyBVN = async (data: BVNVerificationRequest): Promise<BVNVerificationResponse> => {
  try {
    const token = getAuthToken();
    
    const response = await axios.post(
      `${API_BASE_URL}${BVN_VERIFY}`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('BVN verification error:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('API URL used:', `${API_BASE_URL}${BVN_VERIFY}`);
    throw new Error(error.response?.data?.message || `BVN verification failed (${error.response?.status})`);
  }
};

// Get BVN verification status
export const getBVNStatus = async (): Promise<BVNStatusResponse> => {
  try {
    const token = getAuthToken();
    
    const response = await axios.get(
      `${API_BASE_URL}${BVN_STATUS}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Get BVN status error:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('API URL used:', `${API_BASE_URL}${BVN_STATUS}`);
    throw new Error(error.response?.data?.message || `Failed to get BVN status (${error.response?.status})`);
  }
};
