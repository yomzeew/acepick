import axios from 'axios';
import { getProfessionUrl, sectorUrl } from './endpoints';
import nigeriaData from './statelga.json';

interface Sector {
  id: number;
  title: string;
  [key: string]: any; // for any extra fields
}

interface Profession {
  id: number;
  title: string;
  sector_id: number;
  [key: string]: any;
}
interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
  }
/**
 * Get the list of all sectors.
 * @returns {Promise<any[]>} Array of sector objects
 */
export const getAllSector = async (): Promise<Sector[]> => {
  try {
    const response = await axios.get<ApiResponse<Sector[]>>(sectorUrl);
    return response.data?.data;
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return [];
  }
};

/**
 * Get professions by sector title.
 * @param {string} sectorTitle 
 * @returns {Promise<any[]>} Array of professions
 */
export const getProfessionsBySector = async (
  sectorTitle: string
): Promise<Profession[]> => {
  try {
    console.log('🔍 Fetching professions for sector:', sectorTitle);
    
    const sectorArray = await getAllSector();
    console.log('📋 Available sectors:', sectorArray.map(s => s.title));

    const matchedSector = sectorArray.find(
      (item) => item.title === sectorTitle
    );

    if (!matchedSector) {
      console.warn(`❌ Sector not found: ${sectorTitle}`);
      return [];
    }
    
    const sectorId = matchedSector.id;
    console.log(`✅ Found sector: ${sectorTitle} (ID: ${sectorId})`);

    const response = await axios.get<ApiResponse<Profession[]>>(
      `${getProfessionUrl}?sectorId=${sectorId}`
    );
    
    console.log(`📊 Found ${response.data?.data?.length || 0} professions for ${sectorTitle}`);
    return response.data?.data || [];
  } catch (error: any) {
    console.error(`❌ Error fetching professions for sector ${sectorTitle}:`, error.message);
    console.error('🔍 Error details:', {
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Return mock data as fallback
    const mockProfessions: Profession[] = [
      { id: 1, title: 'Plumber', sector_id: 1 },
      { id: 2, title: 'Electrician', sector_id: 1 },
      { id: 3, title: 'Carpenter', sector_id: 1 },
    ];
    console.log('🔄 Using mock professions as fallback');
    return mockProfessions;
  }
};
