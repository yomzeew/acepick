import axios, { AxiosResponse } from 'axios';
import { store } from 'redux/store';
import { 
  acceptdeliveryUrl, 
  pickupdeliveryUrl, 
  confirmPickupUrl, 
  intransitdeliveryUrl, 
  deliveredUrl, 
  confirmDeliveredUrl 
} from 'utilizes/endpoints';

// Type definitions
interface DeliveryAction {
  id: number;
  status: string;
  notes?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return store.getState().auth?.token || null;
};

// Helper function to create auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// API functions with proper typing and error handling
export const acceptDeliveryFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${acceptdeliveryUrl}/${id}`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to accept delivery');
  }
};

export const PickupFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${pickupdeliveryUrl}/${id}`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to mark pickup');
  }
};

export const confirmPickupFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${confirmPickupUrl}/${id}`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to confirm pickup');
  }
};

export const inTransitFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${intransitdeliveryUrl}/${id}`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to start transit');
  }
};

export const deliveredFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${deliveredUrl}/${id}`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to mark delivery');
  }
};

export const confirmDeliverdFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${confirmDeliveredUrl}/${id}`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to confirm delivery');
  }
};

// Additional delivery functions
export const pendingdeliveryFn = async (): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.get(
      `${acceptdeliveryUrl}/pending`, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch pending deliveries');
  }
};

export const riderOrdersFn = async (status?: string): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const url = status ? `${acceptdeliveryUrl}/rider/${status}` : `${acceptdeliveryUrl}/rider`;
    const response: AxiosResponse<ApiResponse> = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch rider orders');
  }
};

export const createOrderFn = async (orderData: any): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(
      `${acceptdeliveryUrl}/create`, 
      orderData, 
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create order');
  }
};