import axios, { AxiosResponse } from 'axios';
import { store } from 'redux/store';
import { ProductTransactionDetail } from 'types/getProductByTrans';
import { ProductData } from 'types/productdataType';
import { ProductTransaction } from 'types/productTransType';
import { Product } from 'types/type';
import { 
  addProductUrl,
  getBoughtProductUrl, 
  getCategoriesUrl, 
  getProductmineUrl, 
  getProductTransactionByIdUrl, 
  getProductTransUrl,
  getProductUrl,
  getSoldProductUrl, 
  productUrl, 
  selectProdectUrl
} from 'utilizes/endpoints';
import MockDataService from './mockDataService';
import { uploadProductImages } from './supabaseStorage';

// Type definitions


interface Category {
  id: number;
  name: string;
  description?: string;
}

interface TransactionStatus {
  pending: string;
  ordered: string;
  completed: string;
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
export const getCategories = async (): Promise<Category[]> => {
  try {
    // Categories are public, no auth needed
    const response: AxiosResponse<ApiResponse<Category[]>> = await axios.get(getCategoriesUrl);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch categories');
  }
};

export const addproductFn = async (data: Partial<ProductData>): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(addProductUrl, data, { headers });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to add product');
  }
};

export const getproductFn = async (query: string): Promise<Product[]> => {
  try {
    // For public products endpoint, no auth needed
    const response: AxiosResponse<ApiResponse<Product[]>> = await axios.get(`${productUrl}?${query}`);
    return response.data.data || [];
  } catch (error: any) {
    // If server is unavailable or returns error, fall back to mock data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.response?.status >= 400) {
      console.log('Server error, using mock data for products:', error.response?.data?.message || error.message);
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Laptop Stand',
          description: 'Adjustable aluminum laptop stand',
          images: ['https://picsum.photos/seed/product1/200/200'],
          categoryId: 1,
          quantity: 10,
          price: '2500',
          discount: 0,
          userId: '2',
          locationId: 1,
          category: {
            id: 1,
            name: 'Electronics',
            description: 'Electronic devices and accessories'
          },
          location: {
            id: 1,
            address: '456 Oak Avenue, Abuja, Nigeria',
            lga: 'Abuja Municipal',
            state: 'Abuja',
            latitude: 9.0765,
            longitude: 7.3986,
            zipcode: null,
            userId: '2',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z'
          },
          user: {
            id: '2',
            email: 'pro@example.com',
            phone: '+1234567891',
            role: 'professional',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z'
          } as any
        },
        {
          id: 2,
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          images: ['https://picsum.photos/seed/product2/200/200'],
          categoryId: 2,
          quantity: 5,
          price: '15000',
          discount: 10,
          userId: '3',
          locationId: 2,
          category: {
            id: 2,
            name: 'Furniture',
            description: 'Office and home furniture'
          },
          location: {
            id: 2,
            address: '789 Pine Road, Port Harcourt, Nigeria',
            lga: 'Port Harcourt Municipal',
            state: 'Rivers',
            latitude: 4.8156,
            longitude: 7.0498,
            zipcode: null,
            userId: '3',
            createdAt: '2024-01-05T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z'
          },
          user: {
            id: '3',
            email: 'delivery@example.com',
            phone: '+1234567892',
            role: 'delivery',
            createdAt: '2024-01-05T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z'
          } as any
        },
        {
          id: 3,
          name: 'Wireless Mouse',
          description: 'Bluetooth wireless mouse with long battery life',
          images: ['https://picsum.photos/seed/product3/200/200'],
          categoryId: 1,
          quantity: 15,
          price: '3500',
          discount: 5,
          userId: '1',
          locationId: 3,
          category: {
            id: 1,
            name: 'Electronics',
            description: 'Electronic devices and accessories'
          },
          location: {
            id: 3,
            address: '123 Main Street, Lagos, Nigeria',
            lga: 'Lagos Mainland',
            state: 'Lagos',
            latitude: 6.5244,
            longitude: 3.3792,
            zipcode: null,
            userId: '1',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z'
          },
          user: {
            id: '1',
            email: 'client@example.com',
            phone: '+1234567890',
            role: 'client',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z'
          } as any
        }
      ];
      return mockProducts;
    }
    throw new Error(error?.response?.data?.message || 'Failed to fetch products');
  }
};

export const getproductByIdFn = async (id: number): Promise<ProductData> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = getProductUrl(String(id));
    const response: AxiosResponse<ApiResponse<ProductData>> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch product');
  }
};

/**
 * Upload product images to Supabase Storage.
 * @param uris - Array of local image URIs
 * @returns API-shaped response with { data: { urls: string[] } }
 */
export const uploadProduct = async (uris: string[]): Promise<ApiResponse> => {
  try {
    const urls = await uploadProductImages(uris);
    return { success: true, message: 'success', data: { urls } };
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to upload product');
  }
};

export const getMineProduct = async (): Promise<Product[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<Product[]>> = await axios.get(getProductmineUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch your products');
  }
};

export const getTransProduct = async (status: keyof TransactionStatus): Promise<ProductData[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<ProductData[]>> = await axios.get(`${getProductTransUrl}/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch transaction products');
  }
};

export const getSoldProduct = async (): Promise<ProductTransaction[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<ProductTransaction[]>> = await axios.get(getSoldProductUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch sold products');
  }
};

export const getBoughtProduct = async (): Promise<ProductTransaction[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<ProductTransaction[]>> = await axios.get(getBoughtProductUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch bought products');
  }
};

export const selectProduct = async (params: { 
  productId: number; 
  quantity?: number; 
  orderMethod?: 'delivery' | 'self_pickup' 
}): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(selectProdectUrl, params, { headers });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to select product');
  }
};

// Alias for backward compatibility
export const selectproductFn = selectProduct;

export const getProductByTransactionFn = async ({ id }: { id: number }): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse> = await axios.get(getProductTransactionByIdUrl(String(id)), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch product transaction');
  }
};

// Alias functions for backward compatibility
export const getSoldProductFn = async (params?: { status?: string }): Promise<ProductTransaction[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<ProductTransaction[]>> = await axios.get(getSoldProductUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params, // Axios auto builds the query string
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch sold products');
  }
};

export const getBoughtProductFn = async (params?: { status?: string }): Promise<ProductTransaction[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<ProductTransaction[]>> = await axios.get(getBoughtProductUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params, // Axios auto builds the query string
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch bought products');
  }
  };
  