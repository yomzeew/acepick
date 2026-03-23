import axios, { AxiosResponse } from 'axios';
import { store, RootState } from 'redux/store';
import {
  acceptdeliveryUrl,
  enRouteToPickupUrl,
  arrivedAtPickupUrl,
  pickupdeliveryUrl,
  confirmPickupUrl,
  arrivedAtDropoffUrl,
  deliveredUrl,
  confirmDeliveredUrl,
  retryRiderSearchUrl,
  getOrderByIdUrl,
  paidOrdersUrl,
  riderOrdersUrl,
  createOrderUrl,
  sellerAcceptOrderUrl,
  sellerRejectOrderUrl,
  sellerMarkReadyUrl,
  sellerConfirmUrl,
  returnRequestUrl,
} from 'utilizes/endpoints';

// Type definitions
interface ApiResponse<T = any> {
  status: boolean;
  data: T;
  message?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return (store.getState() as RootState).auth?.token || null;
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

// ─── Rider: Accept order ───
export const acceptDeliveryFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      acceptdeliveryUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to accept delivery');
  }
};

// ─── Rider: En route to pickup ───
export const enRouteToPickupFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      enRouteToPickupUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update en route to pickup');
  }
};

// ─── Rider: Arrived at pickup ───
export const arrivedAtPickupFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      arrivedAtPickupUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update arrived at pickup');
  }
};

// ─── Rider: Picked up ───
export const PickupFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      pickupdeliveryUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to mark pickup');
  }
};

// ─── Vendor: Confirm pickup ───
export const confirmPickupFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      confirmPickupUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to confirm pickup');
  }
};

// ─── Rider: Arrived at dropoff ───
export const arrivedAtDropoffFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      arrivedAtDropoffUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update arrived at dropoff');
  }
};

// ─── Rider: Delivered ───
export const deliveredFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      deliveredUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to mark delivery');
  }
};

// ─── Buyer: Confirm delivery ───
export const confirmDeliverdFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      confirmDeliveredUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to confirm delivery');
  }
};

// ─── Buyer: Retry rider search (expired order) ───
export const retryRiderSearchFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(
      retryRiderSearchUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to retry rider search');
  }
};

// ─── Get order by ID ───
export const getOrderByIdFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.get(
      getOrderByIdUrl(String(id)),
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch order');
  }
};

// ─── Rider: Get nearest paid orders ───
export const pendingdeliveryFn = async (): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.get(
      paidOrdersUrl,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch pending deliveries');
  }
};

// ─── Rider: Get rider orders ───
export const riderOrdersFn = async (status?: string): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const params = status && status !== 'all' ? { status } : {};
    const response: AxiosResponse<ApiResponse> = await axios.get(
      riderOrdersUrl,
      { headers, params }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch rider orders');
  }
};

// ─── Buyer: Dispute order ───
export const disputeOrderFn = async (data: {
  reason: string;
  description: string;
  productTransactionId: number;
  partnerId?: string;
}): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const { disputeOrderUrl } = require('utilizes/endpoints');
    const response: AxiosResponse<ApiResponse> = await axios.post(
      disputeOrderUrl,
      data,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to raise dispute');
  }
};

// ─── Buyer: Create delivery order ───
export const createOrderFn = async (orderData: any): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(
      createOrderUrl,
      orderData,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.response?.data?.errors || 'Failed to create order');
  }
};

// ═══════════════════════════════════════════════════════
//  SELLER ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════

// ─── Seller: Accept order ───
export const sellerAcceptOrderFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      sellerAcceptOrderUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to accept order');
  }
};

// ─── Seller: Reject order ───
export const sellerRejectOrderFn = async (data: { id: number; reason: string }): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      sellerRejectOrderUrl(String(data.id)),
      { reason: data.reason },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to reject order');
  }
};

// ─── Seller: Mark ready for delivery ───
export const sellerMarkReadyFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      sellerMarkReadyUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to mark order ready');
  }
};

// ─── Seller: Confirm order completion (releases payment) ───
export const sellerConfirmCompletionFn = async (id: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.put(
      sellerConfirmUrl(String(id)),
      {},
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to confirm order completion');
  }
};

// ═══════════════════════════════════════════════════════
//  RETURN REQUESTS
// ═══════════════════════════════════════════════════════

// ─── Buyer: Request return ───
export const requestReturnFn = async (data: {
  reason: string;
  description: string;
  evidence?: string;
  productTransactionId: number;
}): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(
      returnRequestUrl,
      data,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to request return');
  }
};