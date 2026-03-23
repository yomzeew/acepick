import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  giveRatingUrl,
  isRatedUrl,
  getAverageRatingUrl,
  getRatingsByUserUrl,
  getRatingsForUserUrl,
  updateRatingUrl,
  deleteRatingUrl
} from '../../utilizes/endpoints';

// Types
export interface Rating {
  id: string;
  orderId: string;
  serviceId?: string;
  productId?: string;
  raterId: string;
  ratedUserId: string;
  rating: number; // 1-5
  comment?: string;
  type: 'service' | 'product' | 'delivery' | 'professional';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AverageRating {
  userId?: string;
  productId?: string;
  serviceId?: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface RatingStats {
  totalGiven: number;
  totalReceived: number;
  averageGiven: number;
  averageReceived: number;
  recentRatings: Rating[];
}

export interface RatingState {
  ratings: Rating[];
  myRatings: Rating[];
  ratingsForMe: Rating[];
  averageRatings: Record<string, AverageRating>;
  currentRating: Rating | null;
  isLoading: boolean;
  error: string | null;
  stats: RatingStats;
  filters: {
    type?: string;
    rating?: number;
    dateRange?: [string, string];
    status?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: RatingState = {
  ratings: [],
  myRatings: [],
  ratingsForMe: [],
  averageRatings: {},
  currentRating: null,
  isLoading: false,
  error: null,
  stats: {
    totalGiven: 0,
    totalReceived: 0,
    averageGiven: 0,
    averageReceived: 0,
    recentRatings: [],
  },
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const giveRatingAsync = createAsyncThunk(
  'rating/giveRating',
  async (ratingData: Omit<Rating, 'id' | 'status' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(giveRatingUrl, ratingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit rating');
    }
  }
);

export const checkIsRatedAsync = createAsyncThunk(
  'rating/checkIsRated',
  async (params: { orderId?: string; productId?: string; serviceId?: string; raterId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(isRatedUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check rating status');
    }
  }
);

export const getAverageRatingAsync = createAsyncThunk(
  'rating/getAverageRating',
  async (params: { userId?: string; productId?: string; serviceId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/ratings/average', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch average rating');
    }
  }
);

export const getRatingsByUserAsync = createAsyncThunk(
  'rating/getRatingsByUser',
  async (params: { userId: string; page?: number; limit?: number; type?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getRatingsByUserUrl(userId), { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user ratings');
    }
  }
);

export const getRatingsForUserAsync = createAsyncThunk(
  'rating/getRatingsForUser',
  async (params: { userId: string; page?: number; limit?: number; type?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getRatingsForUserUrl(userId), { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ratings for user');
    }
  }
);

export const updateRatingAsync = createAsyncThunk(
  'rating/updateRating',
  async ({ id, data }: { id: string; data: Partial<Rating> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(updateRatingUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update rating');
    }
  }
);

export const deleteRatingAsync = createAsyncThunk(
  'rating/deleteRating',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteRatingUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete rating');
    }
  }
);

export const getRatingStatsAsync = createAsyncThunk(
  'rating/getRatingStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/ratings/stats/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rating stats');
    }
  }
);

export const reportRatingAsync = createAsyncThunk(
  'rating/reportRating',
  async ({ ratingId, reason, description }: { ratingId: string; reason: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/ratings/${ratingId}/report`, { reason, description });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report rating');
    }
  }
);

// Slice
const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRating: (state, action: PayloadAction<Rating | null>) => {
      state.currentRating = action.payload;
    },
    clearCurrentRating: (state) => {
      state.currentRating = null;
    },
    setFilters: (state, action: PayloadAction<Partial<RatingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateAverageRating: (state, action: PayloadAction<{ key: string; data: AverageRating }>) => {
      const { key, data } = action.payload;
      state.averageRatings[key] = data;
    },
    removeRating: (state, action: PayloadAction<string>) => {
      const ratingId = action.payload;
      state.ratings = state.ratings.filter(r => r.id !== ratingId);
      state.myRatings = state.myRatings.filter(r => r.id !== ratingId);
      state.ratingsForMe = state.ratingsForMe.filter(r => r.id !== ratingId);
      if (state.currentRating?.id === ratingId) {
        state.currentRating = null;
      }
    },
    updateRatingStatus: (state, action: PayloadAction<{ ratingId: string; status: Rating['status'] }>) => {
      const { ratingId, status } = action.payload;
      const updateArray = (arr: Rating[]) => {
        const index = arr.findIndex(r => r.id === ratingId);
        if (index !== -1) arr[index].status = status;
      };
      updateArray(state.ratings);
      updateArray(state.myRatings);
      updateArray(state.ratingsForMe);
      if (state.currentRating?.id === ratingId) {
        state.currentRating.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    // Give Rating
    builder
      .addCase(giveRatingAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(giveRatingAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const rating = action.payload.data || action.payload.rating;
        if (rating) {
          state.myRatings.unshift(rating);
          state.currentRating = rating;
        }
      })
      .addCase(giveRatingAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Is Rated
    builder
      .addCase(checkIsRatedAsync.fulfilled, (state, action) => {
        const isRated = action.payload.data || action.payload.isRated;
        if (isRated && isRated.rating) {
          state.currentRating = isRated.rating;
        }
      });

    // Get Average Rating
    builder
      .addCase(getAverageRatingAsync.fulfilled, (state, action) => {
        const averageRating = action.payload.data || action.payload.averageRating;
        if (averageRating) {
          const key = averageRating.userId || averageRating.productId || averageRating.serviceId || 'default';
          state.averageRatings[key] = averageRating;
        }
      });

    // Get Ratings by User
    builder
      .addCase(getRatingsByUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRatingsByUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRatings = action.payload.data || action.payload.ratings || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getRatingsByUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Ratings for User
    builder
      .addCase(getRatingsForUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRatingsForUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratingsForMe = action.payload.data || action.payload.ratings || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getRatingsForUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Rating
    builder
      .addCase(updateRatingAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRatingAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.rating;
        if (updated) {
          const updateArray = (arr: Rating[]) => {
            const index = arr.findIndex(r => r.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.ratings);
          updateArray(state.myRatings);
          updateArray(state.ratingsForMe);
          if (state.currentRating?.id === updated.id) {
            state.currentRating = updated;
          }
        }
      })
      .addCase(updateRatingAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Rating
    builder
      .addCase(deleteRatingAsync.fulfilled, (state, action) => {
        const ratingId = action.payload;
        state.ratings = state.ratings.filter(r => r.id !== ratingId);
        state.myRatings = state.myRatings.filter(r => r.id !== ratingId);
        state.ratingsForMe = state.ratingsForMe.filter(r => r.id !== ratingId);
        if (state.currentRating?.id === ratingId) {
          state.currentRating = null;
        }
      });

    // Get Rating Stats
    builder
      .addCase(getRatingStatsAsync.fulfilled, (state, action) => {
        state.stats = action.payload.data || action.payload.stats || state.stats;
      });

    // Report Rating
    builder
      .addCase(reportRatingAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.rating;
        if (updated) {
          const updateArray = (arr: Rating[]) => {
            const index = arr.findIndex(r => r.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.ratings);
          updateArray(state.myRatings);
          updateArray(state.ratingsForMe);
          if (state.currentRating?.id === updated.id) {
            state.currentRating = updated;
          }
        }
      });
  },
});

export const {
  clearError,
  setCurrentRating,
  clearCurrentRating,
  setFilters,
  clearFilters,
  updateAverageRating,
  removeRating,
  updateRatingStatus,
} = ratingSlice.actions;

export default ratingSlice.reducer;
