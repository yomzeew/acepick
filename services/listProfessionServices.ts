import axios, { AxiosResponse } from 'axios';
import { sectorUrl } from 'utilizes/endpoints';

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
    throw new Error(error?.response?.data?.message || 'Failed to fetch sectors');
  }
};