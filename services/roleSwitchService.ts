import axios from "axios";
import { API_BASE_URL, ROLE_SWITCH, SECTORS, PROFESSIONS } from "utilizes/endpoints";

const getAuthHeader = (token?: string) => {
  const authToken = token || (typeof window !== 'undefined' ? (window as any).__AUTH_TOKEN__ : null);
  if (!authToken) {
    throw new Error('No authentication token provided');
  }
  return { headers: { Authorization: `Bearer ${authToken}` } };
};

export interface RoleOption {
  role: string;
  label: string;
  available: boolean;
}

export interface AvailableRolesResponse {
  currentRole: string;
  roles: RoleOption[];
}

export interface SwitchRoleResponse {
  user: any;
  token: string;
}

export interface Sector {
  id: number;
  title: string;
  image: string | null;
}

export interface Profession {
  id: number;
  title: string;
  sectorId: number;
  image: string | null;
}

/** Fetch which roles the current user can switch to */
export const getAvailableRolesFn = async (token: string): Promise<AvailableRolesResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}${ROLE_SWITCH.AVAILABLE_ROLES}`,
    getAuthHeader(token)
  );
  return response.data.data;
};

/** Switch the current user's active role */
export const switchRoleFn = async (role: string, token: string): Promise<SwitchRoleResponse> => {
  const response = await axios.put(
    `${API_BASE_URL}${ROLE_SWITCH.SWITCH}`,
    { role },
    getAuthHeader(token)
  );
  return response.data.data;
};

/** Fetch all sectors */
export const getSectorsFn = async (token: string): Promise<Sector[]> => {
  const response = await axios.get(
    `${API_BASE_URL}${SECTORS.LIST}`,
    getAuthHeader(token)
  );
  return response.data.data;
};

/** Fetch professions filtered by sector */
export const getProfessionsBySectorFn = async (sectorId: number, token: string): Promise<Profession[]> => {
  const response = await axios.get(
    `${API_BASE_URL}${PROFESSIONS.LIST}?sector_id=${sectorId}`,
    getAuthHeader(token)
  );
  return response.data.data;
};

/** Create professional profile + switch role in one call */
export const setupProfessionalFn = async (professionId: number, token: string): Promise<SwitchRoleResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}${ROLE_SWITCH.SETUP_PROFESSIONAL}`,
    { professionId },
    getAuthHeader(token)
  );
  return response.data.data;
};

export const setupDeliveryFn = async (vehicleType: string, licenseNumber: string, token: string): Promise<SwitchRoleResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}${ROLE_SWITCH.SETUP_DELIVERY}`,
    { vehicleType, licenseNumber },
    getAuthHeader(token)
  );
  return response.data.data;
};
