import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  giveReviewUrl,
  editReviewUrl,
  deleteReviewUrl,
  getReviewsByUserUrl,
  getReviewsForUserUrl,
  getReviewsByProductUrl,
  getReviewsByServiceUrl,
  likeReviewUrl,
  reportReviewUrl,
  getReviewStatsUrl
} from '../../utilizes/endpoints';

// Types
export interface Review {
  id: string;
  orderId?: string;
  productId?: string;
  serviceId?: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  reportCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  response?: {
    id: string;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedReviews: number;
  publicReviews: number;
  recentReviews: Review[];
}

export interface ReviewSummary {
  productId?: string;
  serviceId?: string;
  userId?: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  topPositiveReviews: Review[];
  topCriticalReviews: Review[];
}

export interface ReviewState {
  reviews: Review[];
  myReviews: Review[];
  reviewsForMe: Review[];
  productReviews: Record<string, Review[]>;
  serviceReviews: Record<string, Review[]>;
  currentReview: Review | null;
  reviewStats: Record<string, ReviewStats>;
  reviewSummaries: Record<string, ReviewSummary>;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    rating?: number;
    isVerified?: boolean;
    isPublic?: boolean;
    status?: string;
    dateRange?: [string, string];
    hasImages?: boolean;
  };
  sortBy: 'recent' | 'rating_high' | 'rating_low' | 'helpful';
  sortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: ReviewState = {
  reviews: [],
  myReviews: [],
  reviewsForMe: [],
  productReviews: {},
  serviceReviews: {},
  currentReview: null,
  reviewStats: {},
  reviewSummaries: {},
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  sortBy: 'recent',
  sortOrder: 'desc',
};

// Async thunks
export const giveReviewAsync = createAsyncThunk(
  'review/giveReview',
  async (reviewData: Omit<Review, 'id' | 'helpfulCount' | 'reportCount' | 'status' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(giveReviewUrl, reviewData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const editReviewAsync = createAsyncThunk(
  'review/editReview',
  async ({ id, data }: { id: string; data: Partial<Review> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(editReviewUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit review');
    }
  }
);

export const deleteReviewAsync = createAsyncThunk(
  'review/deleteReview',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteReviewUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const getReviewsByUserAsync = createAsyncThunk(
  'review/getReviewsByUser',
  async (params: { userId: string; page?: number; limit?: number; sortBy?: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reviews/user/${params.userId}`, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  }
);

export const getReviewsForUserAsync = createAsyncThunk(
  'review/getReviewsForUser',
  async (params: { userId: string; page?: number; limit?: number; sortBy?: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reviews/for-user/${params.userId}`, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews for user');
    }
  }
);

export const getReviewsByProductAsync = createAsyncThunk(
  'review/getReviewsByProduct',
  async (params: { productId: string; page?: number; limit?: number; sortBy?: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reviews/product/${params.productId}`, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product reviews');
    }
  }
);

export const getReviewsByServiceAsync = createAsyncThunk(
  'review/getReviewsByService',
  async (params: { serviceId: string; page?: number; limit?: number; sortBy?: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reviews/service/${params.serviceId}`, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service reviews');
    }
  }
);

export const likeReviewAsync = createAsyncThunk(
  'review/likeReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like review');
    }
  }
);

export const reportReviewAsync = createAsyncThunk(
  'review/reportReview',
  async ({ reviewId, reason, description }: { reviewId: string; reason: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/report`, { reason, description });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report review');
    }
  }
);

export const respondToReviewAsync = createAsyncThunk(
  'review/respondToReview',
  async ({ reviewId, comment }: { reviewId: string; comment: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/respond`, { comment });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to review');
    }
  }
);

export const getReviewStatsAsync = createAsyncThunk(
  'review/getReviewStats',
  async (params: { productId?: string; serviceId?: string; userId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/reviews/stats', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review stats');
    }
  }
);

export const getReviewSummaryAsync = createAsyncThunk(
  'review/getReviewSummary',
  async (params: { productId?: string; serviceId?: string; userId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/reviews/summary', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review summary');
    }
  }
);

// Slice
const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
      state.currentReview = action.payload;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ReviewState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSortBy: (state, action: PayloadAction<ReviewState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<ReviewState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    updateReviewHelpfulCount: (state, action: PayloadAction<{ reviewId: string; increment: boolean }>) => {
      const { reviewId, increment } = action.payload;
      const updateArray = (arr: Review[]) => {
        const index = arr.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          arr[index].helpfulCount += increment ? 1 : -1;
        }
      };
      updateArray(state.reviews);
      updateArray(state.myReviews);
      updateArray(state.reviewsForMe);
      
      // Update in product and service reviews
      Object.values(state.productReviews).forEach(updateArray);
      Object.values(state.serviceReviews).forEach(updateArray);
      
      if (state.currentReview?.id === reviewId) {
        state.currentReview.helpfulCount += increment ? 1 : -1;
      }
    },
    removeReview: (state, action: PayloadAction<string>) => {
      const reviewId = action.payload;
      state.reviews = state.reviews.filter(r => r.id !== reviewId);
      state.myReviews = state.myReviews.filter(r => r.id !== reviewId);
      state.reviewsForMe = state.reviewsForMe.filter(r => r.id !== reviewId);
      
      // Remove from product and service reviews
      Object.keys(state.productReviews).forEach(key => {
        state.productReviews[key] = state.productReviews[key].filter(r => r.id !== reviewId);
      });
      Object.keys(state.serviceReviews).forEach(key => {
        state.serviceReviews[key] = state.serviceReviews[key].filter(r => r.id !== reviewId);
      });
      
      if (state.currentReview?.id === reviewId) {
        state.currentReview = null;
      }
    },
    updateReviewStatus: (state, action: PayloadAction<{ reviewId: string; status: Review['status'] }>) => {
      const { reviewId, status } = action.payload;
      const updateArray = (arr: Review[]) => {
        const index = arr.findIndex(r => r.id === reviewId);
        if (index !== -1) arr[index].status = status;
      };
      updateArray(state.reviews);
      updateArray(state.myReviews);
      updateArray(state.reviewsForMe);
      
      Object.values(state.productReviews).forEach(updateArray);
      Object.values(state.serviceReviews).forEach(updateArray);
      
      if (state.currentReview?.id === reviewId) {
        state.currentReview.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    // Give Review
    builder
      .addCase(giveReviewAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(giveReviewAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const review = action.payload.data || action.payload.review;
        if (review) {
          state.myReviews.unshift(review);
          state.currentReview = review;
        }
      })
      .addCase(giveReviewAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Edit Review
    builder
      .addCase(editReviewAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editReviewAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.review;
        if (updated) {
          const updateArray = (arr: Review[]) => {
            const index = arr.findIndex(r => r.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.reviews);
          updateArray(state.myReviews);
          updateArray(state.reviewsForMe);
          
          Object.values(state.productReviews).forEach(updateArray);
          Object.values(state.serviceReviews).forEach(updateArray);
          
          if (state.currentReview?.id === updated.id) {
            state.currentReview = updated;
          }
        }
      })
      .addCase(editReviewAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Review
    builder
      .addCase(deleteReviewAsync.fulfilled, (state, action) => {
        const reviewId = action.payload;
        state.reviews = state.reviews.filter(r => r.id !== reviewId);
        state.myReviews = state.myReviews.filter(r => r.id !== reviewId);
        state.reviewsForMe = state.reviewsForMe.filter(r => r.id !== reviewId);
        
        Object.keys(state.productReviews).forEach(key => {
          state.productReviews[key] = state.productReviews[key].filter(r => r.id !== reviewId);
        });
        Object.keys(state.serviceReviews).forEach(key => {
          state.serviceReviews[key] = state.serviceReviews[key].filter(r => r.id !== reviewId);
        });
        
        if (state.currentReview?.id === reviewId) {
          state.currentReview = null;
        }
      });

    // Get Reviews by User
    builder
      .addCase(getReviewsByUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviewsByUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myReviews = action.payload.data || action.payload.reviews || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getReviewsByUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Reviews for User
    builder
      .addCase(getReviewsForUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviewsForUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviewsForMe = action.payload.data || action.payload.reviews || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getReviewsForUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Reviews by Product
    builder
      .addCase(getReviewsByProductAsync.fulfilled, (state, action) => {
        const { productId } = action.meta.arg;
        const reviews = action.payload.data || action.payload.reviews || [];
        state.productReviews[productId] = reviews;
      });

    // Get Reviews by Service
    builder
      .addCase(getReviewsByServiceAsync.fulfilled, (state, action) => {
        const { serviceId } = action.meta.arg;
        const reviews = action.payload.data || action.payload.reviews || [];
        state.serviceReviews[serviceId] = reviews;
      });

    // Like Review
    builder
      .addCase(likeReviewAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.review;
        if (updated) {
          const updateArray = (arr: Review[]) => {
            const index = arr.findIndex(r => r.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.reviews);
          updateArray(state.myReviews);
          updateArray(state.reviewsForMe);
          
          Object.values(state.productReviews).forEach(updateArray);
          Object.values(state.serviceReviews).forEach(updateArray);
          
          if (state.currentReview?.id === updated.id) {
            state.currentReview = updated;
          }
        }
      });

    // Report Review
    builder
      .addCase(reportReviewAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.review;
        if (updated) {
          const updateArray = (arr: Review[]) => {
            const index = arr.findIndex(r => r.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.reviews);
          updateArray(state.myReviews);
          updateArray(state.reviewsForMe);
          
          Object.values(state.productReviews).forEach(updateArray);
          Object.values(state.serviceReviews).forEach(updateArray);
          
          if (state.currentReview?.id === updated.id) {
            state.currentReview = updated;
          }
        }
      });

    // Respond to Review
    builder
      .addCase(respondToReviewAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.review;
        if (updated) {
          const updateArray = (arr: Review[]) => {
            const index = arr.findIndex(r => r.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.reviews);
          updateArray(state.myReviews);
          updateArray(state.reviewsForMe);
          
          Object.values(state.productReviews).forEach(updateArray);
          Object.values(state.serviceReviews).forEach(updateArray);
          
          if (state.currentReview?.id === updated.id) {
            state.currentReview = updated;
          }
        }
      });

    // Get Review Stats
    builder
      .addCase(getReviewStatsAsync.fulfilled, (state, action) => {
        const { productId, serviceId, userId } = action.meta.arg;
        const key = productId || serviceId || userId || 'default';
        const stats = action.payload.data || action.payload.stats;
        if (stats) {
          state.reviewStats[key] = stats;
        }
      });

    // Get Review Summary
    builder
      .addCase(getReviewSummaryAsync.fulfilled, (state, action) => {
        const { productId, serviceId, userId } = action.meta.arg;
        const key = productId || serviceId || userId || 'default';
        const summary = action.payload.data || action.payload.summary;
        if (summary) {
          state.reviewSummaries[key] = summary;
        }
      });
  },
});

export const {
  clearError,
  setCurrentReview,
  clearCurrentReview,
  setFilters,
  clearFilters,
  setSortBy,
  setSortOrder,
  updateReviewHelpfulCount,
  removeReview,
  updateReviewStatus,
} = reviewSlice.actions;

export default reviewSlice.reducer;
