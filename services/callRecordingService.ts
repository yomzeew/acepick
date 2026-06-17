import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, CALL_RECORDINGS } from '../utilizes/endpoints';

export interface CallRecordingPayload {
  receiverId: string;
  url: string;
  path: string;
  duration: number;
  fileSize?: number;
  callType?: string;
}

export interface CallRecordingItem {
  id: number;
  callerId: string;
  receiverId: string;
  url: string;
  path: string;
  duration: number;
  fileSize: number | null;
  callType: string;
  createdAt: string;
  caller: {
    id: string;
    profile: { firstName: string; lastName: string; avatar: string | null } | null;
  };
  receiver: {
    id: string;
    profile: { firstName: string; lastName: string; avatar: string | null } | null;
  };
}

export interface CallRecordingsResponse {
  recordings: CallRecordingItem[];
  total: number;
  page: number;
  totalPages: number;
}

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  if (!token) throw new Error('Authentication token not found');
  return { Authorization: `Bearer ${token}` };
};

/** Save call recording metadata to backend */
export const saveCallRecordingFn = async (data: CallRecordingPayload) => {
  const headers = await getAuthHeaders();
  const res = await axios.post(`${API_BASE_URL}${CALL_RECORDINGS.SAVE}`, data, { headers });
  return res.data;
};

/** Fetch paginated call recordings */
export const getCallRecordingsFn = async (page = 1, limit = 20): Promise<CallRecordingsResponse> => {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API_BASE_URL}${CALL_RECORDINGS.LIST}`, {
    headers,
    params: { page, limit },
  });
  return res.data;
};

/** Delete a call recording */
export const deleteCallRecordingFn = async (id: number) => {
  const headers = await getAuthHeaders();
  const res = await axios.delete(`${API_BASE_URL}${CALL_RECORDINGS.DELETE(id)}`, { headers });
  return res.data;
};
