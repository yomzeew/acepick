import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  createOrderUrl,
  getNearestPaidOrdersUrl,
  getOrdersRiderUrl,
  getOrdersBuyerUrl,
  getOrdersSellerUrl,
  acceptOrderUrl,
  enRouteToPickupOrderUrl,
  arrivedAtPickupOrderUrl,
  pickupOrderUrl,
  arrivedAtDropoffOrderUrl,
  deliverOrderUrl,
  confirmPickupUrl,
  confirmDeliveryUrl,
  cancelOrderUrl,
  retryOrderUrl,
  disputeOrderUrl,
  resolveDisputeUrl,
  giveRatingUrl,
  isRatedUrl,
  giveReviewUrl,
  editReviewUrl,
  deleteReviewUrl
} from '../../utilizes/endpoints';

// Types
export interface Order {
  id: string;
  productTransactionId: string;
  buyerId: string;
  sellerId: string;
  riderId?: string;
  status: 'pending' | 'paid' | 'accepted' | 'en_route_to_pickup' | 'arrived_at_pickup' | 'picked_up' | 'confirm_pickup' | 'in_transit' | 'arrived_at_dropoff' | 'delivered' | 'confirm_delivery' | 'cancelled' | 'disputed' | 'expired' | 'not_required';
  pickupAddress: string;
  deliveryAddress: string;
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  deliveryCoordinates?: {
    latitude: number;
    longitude: number;
  };
  expiresAt?: string;
  assignedAt?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryFee: number;
  distance?: number;
  duration?: number;
  specialInstructions?: string;
  buyerNotes?: string;
  riderNotes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedBy: 'buyer' | 'seller' | 'rider';
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  resolution?: string;
  evidence?: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface Rating {
  id: string;
  orderId: string;
  ratedBy: 'buyer' | 'seller' | 'rider';
  ratingFor: 'buyer' | 'seller' | 'rider';
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isPublic: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryState {
  orders: Order[];
  currentOrder: Order | null;
  riderOrders: Order[];
  buyerOrders: Order[];
  sellerOrders: Order[];
  nearestPaidOrders: Order[];
  disputes: Dispute[];
  ratings: Rating[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: string;
    dateRange?: [string, string];
    rating?: number;
  };
  deliveryStats: {
    totalDelivered: number;
    totalCancelled: number;
    averageRating: number;
    totalEarnings: number;
    activeDeliveries: number;
  };
  locationTracking: {
    orderId: string;
    coordinates: { latitude: number; longitude: number };
    timestamp: string;
  } | null;
}

// Initial state
const initialState: DeliveryState = {
  orders: [],
  currentOrder: null,
  riderOrders: [],
  buyerOrders: [],
  sellerOrders: [],
  nearestPaidOrders: [],
  disputes: [],
  ratings: [],
  reviews: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  deliveryStats: {
    totalDelivered: 0,
    totalCancelled: 0,
    averageRating: 0,
    totalEarnings: 0,
    activeDeliveries: 0,
  },
  locationTracking: null,
};

// Async thunks
export const createOrderAsync = createAsyncThunk(
  'delivery/createOrder',
  async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(createOrderUrl, orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchNearestPaidOrdersAsync = createAsyncThunk(
  'delivery/fetchNearestPaidOrders',
  async (params: { latitude: number; longitude: number; radius?: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getNearestPaidOrdersUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby orders');
    }
  }
);

export const fetchRiderOrdersAsync = createAsyncThunk(
  'delivery/fetchRiderOrders',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getOrdersRiderUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rider orders');
    }
  }
);

export const fetchBuyerOrdersAsync = createAsyncThunk(
  'delivery/fetchBuyerOrders',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getOrdersBuyerUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch buyer orders');
    }
  }
);

export const fetchSellerOrdersAsync = createAsyncThunk(
  'delivery/fetchSellerOrders',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getOrdersSellerUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller orders');
    }
  }
);

export const acceptOrderAsync = createAsyncThunk(
  'delivery/acceptOrder',
  async ({ orderId, estimatedDeliveryTime }: { orderId: string; estimatedDeliveryTime?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(acceptOrderUrl(orderId), { estimatedDeliveryTime });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept order');
    }
  }
);

export const pickupOrderAsync = createAsyncThunk(
  'delivery/pickupOrder',
  async ({ orderId, pickupImages, notes }: { orderId: string; pickupImages?: string[]; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(pickupOrderUrl(orderId), { pickupImages, notes });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pickup order');
    }
  }
);

export const enRouteToPickupAsync = createAsyncThunk(
  'delivery/enRouteToPickup',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(enRouteToPickupOrderUrl(orderId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update en route to pickup');
    }
  }
);

export const arrivedAtPickupAsync = createAsyncThunk(
  'delivery/arrivedAtPickup',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(arrivedAtPickupOrderUrl(orderId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update arrived at pickup');
    }
  }
);

export const confirmPickupAsync = createAsyncThunk(
  'delivery/confirmPickup',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(confirmPickupUrl(orderId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm pickup');
    }
  }
);

export const arrivedAtDropoffAsync = createAsyncThunk(
  'delivery/arrivedAtDropoff',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(arrivedAtDropoffOrderUrl(orderId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update arrived at dropoff');
    }
  }
);

export const deliverOrderAsync = createAsyncThunk(
  'delivery/deliverOrder',
  async ({ orderId, deliveryImages, notes }: { orderId: string; deliveryImages?: string[]; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(deliverOrderUrl(orderId), { deliveryImages, notes });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deliver order');
    }
  }
);

export const confirmDeliveryAsync = createAsyncThunk(
  'delivery/confirmDelivery',
  async ({ productTransactionId, rating, review }: { productTransactionId: string; rating?: number; review?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(confirmDeliveryUrl(productTransactionId), { rating, review });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm delivery');
    }
  }
);

export const cancelOrderAsync = createAsyncThunk(
  'delivery/cancelOrder',
  async ({ orderId, reason }: { orderId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(cancelOrderUrl(orderId), { reason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const retryRiderSearchAsync = createAsyncThunk(
  'delivery/retryRiderSearch',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(retryOrderUrl(orderId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retry rider search');
    }
  }
);

export const disputeOrderAsync = createAsyncThunk(
  'delivery/disputeOrder',
  async ({ orderId, reason, description, evidence }: { orderId: string; reason: string; description: string; evidence?: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(disputeOrderUrl, { orderId, reason, description, evidence });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dispute order');
    }
  }
);

export const resolveDisputeAsync = createAsyncThunk(
  'delivery/resolveDispute',
  async ({ disputeId, resolution }: { disputeId: string; resolution: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(resolveDisputeUrl(disputeId), { resolution });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve dispute');
    }
  }
);

export const giveRatingAsync = createAsyncThunk(
  'delivery/giveRating',
  async ({ orderId, ratingFor, rating, comment }: { orderId: string; ratingFor: 'buyer' | 'seller' | 'rider'; rating: number; comment?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(giveRatingUrl, { orderId, ratingFor, rating, comment });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit rating');
    }
  }
);

export const checkIsRatedAsync = createAsyncThunk(
  'delivery/checkIsRated',
  async ({ orderId, ratingFor }: { orderId: string; ratingFor: 'buyer' | 'seller' | 'rider' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(isRatedUrl, { params: { orderId, ratingFor } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check rating status');
    }
  }
);

export const giveReviewAsync = createAsyncThunk(
  'delivery/giveReview',
  async ({ orderId, rating, title, comment, images }: { orderId: string; rating: number; title?: string; comment: string; images?: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(giveReviewUrl, { orderId, rating, title, comment, images });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const editReviewAsync = createAsyncThunk(
  'delivery/editReview',
  async ({ reviewId, rating, title, comment, images }: { reviewId: string; rating: number; title?: string; comment: string; images?: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.put(editReviewUrl(reviewId), { rating, title, comment, images });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit review');
    }
  }
);

export const deleteReviewAsync = createAsyncThunk(
  'delivery/deleteReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteReviewUrl(reviewId));
      return reviewId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const updateLocationTrackingAsync = createAsyncThunk(
  'delivery/updateLocationTracking',
  async ({ orderId, coordinates }: { orderId: string; coordinates: { latitude: number; longitude: number } }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/orders/track/${orderId}`, coordinates);
      return { orderId, coordinates, timestamp: new Date().toISOString() };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

// Slice
const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action: PayloadAction<Partial<DeliveryState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const { orderId, status } = action.payload;
      const updateArray = (arr: Order[]) => {
        const index = arr.findIndex(order => order.id === orderId);
        if (index !== -1) arr[index].status = status;
      };
      updateArray(state.orders);
      updateArray(state.riderOrders);
      updateArray(state.buyerOrders);
      updateArray(state.sellerOrders);
      updateArray(state.nearestPaidOrders);
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
      }
    },
    setLocationTracking: (state, action: PayloadAction<{ orderId: string; coordinates: { latitude: number; longitude: number } }>) => {
      state.locationTracking = {
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
    },
    clearLocationTracking: (state) => {
      state.locationTracking = null;
    },
    updateDeliveryStats: (state, action: PayloadAction<Partial<DeliveryState['deliveryStats']>>) => {
      state.deliveryStats = { ...state.deliveryStats, ...action.payload };
    },
    addNewDeliveryRequest: (state, action: PayloadAction<Order>) => {
      const exists = state.nearestPaidOrders.some(o => o.id === action.payload.id);
      if (!exists) {
        state.nearestPaidOrders.unshift(action.payload);
      }
    },
    removeDeliveryRequest: (state, action: PayloadAction<string>) => {
      state.nearestPaidOrders = state.nearestPaidOrders.filter(o => o.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const order = action.payload.data || action.payload.order;
        if (order) {
          state.orders.push(order);
          state.buyerOrders.push(order);
        }
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Nearest Paid Orders
    builder
      .addCase(fetchNearestPaidOrdersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearestPaidOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearestPaidOrders = action.payload.data || action.payload.orders || [];
      })
      .addCase(fetchNearestPaidOrdersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Rider Orders
    builder
      .addCase(fetchRiderOrdersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiderOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.riderOrders = action.payload.data || action.payload.orders || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchRiderOrdersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Buyer Orders
    builder
      .addCase(fetchBuyerOrdersAsync.fulfilled, (state, action) => {
        state.buyerOrders = action.payload.data || action.payload.orders || [];
      });

    // Fetch Seller Orders
    builder
      .addCase(fetchSellerOrdersAsync.fulfilled, (state, action) => {
        state.sellerOrders = action.payload.data || action.payload.orders || [];
      });

    // Accept Order
    builder
      .addCase(acceptOrderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptOrderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.nearestPaidOrders);
          updateArray(state.riderOrders);
        }
      })
      .addCase(acceptOrderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Pickup Order
    builder
      .addCase(pickupOrderAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          updateArray(state.buyerOrders);
          updateArray(state.sellerOrders);
        }
      });

    // En Route To Pickup
    builder
      .addCase(enRouteToPickupAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          if (state.currentOrder?.id === updated.id) state.currentOrder = updated;
        }
      });

    // Arrived At Pickup
    builder
      .addCase(arrivedAtPickupAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          if (state.currentOrder?.id === updated.id) state.currentOrder = updated;
        }
      });

    // Confirm Pickup
    builder
      .addCase(confirmPickupAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          updateArray(state.buyerOrders);
          updateArray(state.sellerOrders);
        }
      });

    // Arrived At Dropoff
    builder
      .addCase(arrivedAtDropoffAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          if (state.currentOrder?.id === updated.id) state.currentOrder = updated;
        }
      });

    // Deliver Order
    builder
      .addCase(deliverOrderAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          updateArray(state.buyerOrders);
          updateArray(state.sellerOrders);
        }
      });

    // Confirm Delivery
    builder
      .addCase(confirmDeliveryAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          updateArray(state.buyerOrders);
          updateArray(state.sellerOrders);
        }
      });

    // Cancel Order
    builder
      .addCase(cancelOrderAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.order;
        if (updated) {
          const updateArray = (arr: Order[]) => {
            const index = arr.findIndex(order => order.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.riderOrders);
          updateArray(state.buyerOrders);
          updateArray(state.sellerOrders);
        }
      });

    // Dispute Order
    builder
      .addCase(disputeOrderAsync.fulfilled, (state, action) => {
        const dispute = action.payload.data || action.payload.dispute;
        if (dispute) {
          state.disputes.push(dispute);
        }
      });

    // Resolve Dispute
    builder
      .addCase(resolveDisputeAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.dispute;
        if (updated) {
          const index = state.disputes.findIndex(d => d.id === updated.id);
          if (index !== -1) {
            state.disputes[index] = updated;
          }
        }
      });

    // Give Rating
    builder
      .addCase(giveRatingAsync.fulfilled, (state, action) => {
        const rating = action.payload.data || action.payload.rating;
        if (rating) {
          state.ratings.push(rating);
        }
      });

    // Give Review
    builder
      .addCase(giveReviewAsync.fulfilled, (state, action) => {
        const review = action.payload.data || action.payload.review;
        if (review) {
          state.reviews.push(review);
        }
      });

    // Edit Review
    builder
      .addCase(editReviewAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.review;
        if (updated) {
          const index = state.reviews.findIndex(r => r.id === updated.id);
          if (index !== -1) {
            state.reviews[index] = updated;
          }
        }
      });

    // Delete Review
    builder
      .addCase(deleteReviewAsync.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
      });

    // Update Location Tracking
    builder
      .addCase(updateLocationTrackingAsync.fulfilled, (state, action) => {
        state.locationTracking = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentOrder,
  clearCurrentOrder,
  setFilters,
  clearFilters,
  updateOrderStatus,
  setLocationTracking,
  clearLocationTracking,
  updateDeliveryStats,
  addNewDeliveryRequest,
  removeDeliveryRequest,
} = deliverySlice.actions;

export default deliverySlice.reducer;
