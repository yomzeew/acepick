import axios, { AxiosResponse } from 'axios';
import { sectorUrl } from 'utilizes/endpoints';
import MockDataService from './mockDataService';

// Type definitions
interface Sector {
  id: number;
  title: string;
  description?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const ListofSectors = async (): Promise<Sector[]> => {
  try {
    console.log('🔍 Fetching sectors from:', sectorUrl);
    const response: AxiosResponse<ApiResponse<Sector[]>> = await axios.get(sectorUrl, { timeout: 10000 });
    console.log('✅ Sectors fetched successfully:', response.data.data?.length || 0);
    return response.data.data || [];
  } catch (error: any) {
    console.log('❌ Error fetching sectors:', error.message);
    console.log('🔍 Error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // If server is unavailable, fall back to mock data
    if (error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' ||
        error.message === 'Network Error' ||
        error.message?.includes('Network Error') ||
        !error.response) {
      console.log('🔄 Server unavailable, using mock data for sectors');
      const mockSectors = [
        { id: 1, title: 'Home Services', description: 'Home repairs and maintenance services' },
        { id: 2, title: 'Technology & IT', description: 'Technology and IT services' },
        { id: 3, title: 'Building & Construction', description: 'Construction and building services' },
        { id: 4, title: 'Automotive Services', description: 'Vehicle repair and maintenance' },
        { id: 5, title: 'Education & Training', description: 'Educational and training services' },
        { id: 6, title: 'Health & Wellness', description: 'Health and wellness services' },
        { id: 7, title: 'Beauty & Personal Care', description: 'Beauty and personal care services' },
        { id: 8, title: 'Events & Entertainment', description: 'Event planning and entertainment' },
        { id: 9, title: 'Business & Professional', description: 'Business and professional services' },
        { id: 10, title: 'Food & Catering', description: 'Food and catering services' },
      ];
      return mockSectors;
    }
    throw new Error(error?.response?.data?.message || 'Failed to fetch sectors');
  }
};