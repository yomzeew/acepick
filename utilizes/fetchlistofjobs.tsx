import axios from 'axios';
import { professionalUrl, sectorUrl } from './endpoints';
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
    
    const sectorArray = await getAllSector();

    const matchedSector = sectorArray.find(
      (item) => item.title === sectorTitle
    );

    if (!matchedSector) {
      console.warn(`Sector not found: ${sectorTitle}`);
      return [];
    }
    const sectionId = matchedSector.id;

    const response = await axios.get<ApiResponse<Profession[]>>(
      `${professionalUrl}?sector_id=${sectionId}&order_by=title-asc`
    );
    return response.data?.data;
  } catch (error) {
    console.error(`Error fetching professions for sector ${sectorTitle}:`, error);
    return [];
  }
};
