import axios, { AxiosResponse } from 'axios';
import { sectorUrl } from 'utilizes/endpoints';
import MockDataService from './mockDataService';

// Type definitions
interface Sector {
  id: number;
  name: string;
  description?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const ListofSectors = async (): Promise<Sector[]> => {
  try {
    const response: AxiosResponse<ApiResponse<Sector[]>> = await axios.get(sectorUrl);
    return response.data.data || [];
  } catch (error: any) {
    // If server is unavailable, fall back to mock data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('Server unavailable, using mock data for sectors');
      const mockSectors = [
        { id: 1, name: 'Electrical', description: 'Electrical services and repairs' },
        { id: 2, name: 'Plumbing', description: 'Plumbing services and installations' },
        { id: 3, name: 'Carpentry', description: 'Woodwork and furniture services' },
        { id: 4, name: 'Delivery', description: 'Delivery and logistics services' },
        { id: 5, name: 'Cleaning', description: 'Cleaning and maintenance services' },
      ];
      return mockSectors;
    }
    throw new Error(error?.response?.data?.message || 'Failed to fetch sectors');
  }
};