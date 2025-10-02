import axios, { AxiosResponse } from 'axios';
import { store } from 'redux/store';
import { ProductTransactionDetail } from 'types/getProductByTrans';
import { ProductData } from 'types/productdataType';
import { ProductTransaction } from 'types/productTransType';
import { Product } from 'types/type';
import { 
  getBoughtProductUrl, 
  getCategoriesUrl, 
  getProductmineUrl, 
  getProductTransUrl, 
  getSoldProductUrl, 
  productUrl, 
  selectProdectUrl, 
  uploadProductUrl 
} from 'utilizes/endpoints';

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
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<Category[]>> = await axios.get(getCategoriesUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch categories');
  }
};

export const addproductFn = async (data: Partial<ProductData>): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(productUrl, data, { headers });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to add product');
  }
};

export const getproductFn = async (query: string): Promise<Product[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<Product[]>> = await axios.get(`${productUrl}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch products');
  }
};

export const getproductByIdFn = async (id: number): Promise<ProductData> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse<ProductData>> = await axios.get(`${productUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch product');
  }
};

export const uploadProduct = async (data: FormData): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response: AxiosResponse<ApiResponse> = await axios.post(uploadProductUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to upload product');
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

export const selectProduct = async (productId: number): Promise<ApiResponse> => {
  try {
    const headers = createAuthHeaders();
    const response: AxiosResponse<ApiResponse> = await axios.post(selectProdectUrl, { productId }, { headers });
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

    const response: AxiosResponse<ApiResponse> = await axios.get(`${getProductTransUrl}/${id}`, {
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
  