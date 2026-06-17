import axios from "axios";
import { store } from "redux/store";
import { API_BASE_URL } from "utilizes/endpoints";

export interface RatingData {
  rating: number;
  review?: string;
  jobId?: string;
  orderId?: string;
  professionalId: string;
}

export interface RatingResponse {
  id: string;
  rating: number;
  review?: string;
  jobId?: string;
  orderId?: string;
  professionalId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Review {
  id: string;
  rating: number;
  review: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  professionalId: string;
  jobId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

// Submit a rating for a professional
export const submitRating = async (data: RatingData): Promise<RatingResponse> => {
  const token = store.getState().auth?.token;
  const response = await axios.post(`${API_BASE_URL}/ratings`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get rating stats for a professional
export const getRatingStats = async (professionalId: string): Promise<RatingStats> => {
  const token = store.getState().auth?.token;
  const response = await axios.get(`${API_BASE_URL}/ratings/stats/${professionalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

// Get reviews for a professional
export const getProfessionalReviews = async (professionalId: string, page = 1, limit = 10): Promise<{
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const token = store.getState().auth?.token;
  const response = await axios.get(`${API_BASE_URL}/ratings/professional/${professionalId}`, {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

// Check if user has already rated a job/order
export const hasRated = async (jobId?: string, orderId?: string): Promise<boolean> => {
  const token = store.getState().auth?.token;
  const params = new URLSearchParams();
  if (jobId) params.append('jobId', jobId);
  if (orderId) params.append('orderId', orderId);
  
  const response = await axios.get(`${API_BASE_URL}/ratings/has-rated?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.hasRated;
};

// Update a rating
export const updateRating = async (ratingId: string, data: Partial<RatingData>): Promise<RatingResponse> => {
  const token = store.getState().auth?.token;
  const response = await axios.put(`${API_BASE_URL}/ratings/${ratingId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete a rating
export const deleteRating = async (ratingId: string): Promise<void> => {
  const token = store.getState().auth?.token;
  await axios.delete(`${API_BASE_URL}/ratings/${ratingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Report a rating
export const reportRating = async (ratingId: string, reason: string): Promise<void> => {
  const token = store.getState().auth?.token;
  await axios.post(`${API_BASE_URL}/ratings/${ratingId}/report`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
