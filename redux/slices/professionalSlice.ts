import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  getProfessionUrl, 
  getProfessionByUserIdUrl, 
  getProfessionalByIdUrl,
  getProfessionByIdUrl,
  professionalUrl,
  sectorUrl,
  createProfessionUrl,
  updateProfessionUrl,
  deleteProfessionUrl,
  getCooperatesUrl
} from '../../utilizes/endpoints';

// Types
export interface Professional {
  id: string;
  userId: string;
  profileId: string;
  sectorId?: string;
  professionId?: string;
  yearsOfExperience: number;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  isVerified: boolean;
  isTopRated: boolean;
  bio?: string;
  skills?: string[];
  languages?: string[];
  workRadius?: number;
  responseTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
  sectorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cooperation {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  registrationNumber: string;
  noOfEmployees: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalState {
  professionals: Professional[];
  currentProfessional: Professional | null;
  myProfessionalProfile: Professional | null;
  professions: Profession[];
  sectors: Sector[];
  cooperations: Cooperation[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    sector?: string;
    profession?: string;
    rating?: number;
    availability?: string;
    location?: string;
  };
}

// Initial state
const initialState: ProfessionalState = {
  professionals: [],
  currentProfessional: null,
  myProfessionalProfile: null,
  professions: [],
  sectors: [],
  cooperations: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks
export const fetchProfessionalsAsync = createAsyncThunk(
  'professional/fetchProfessionals',
  async (params: { page?: number; limit?: number; sector?: string; profession?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getProfessionUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch professionals');
    }
  }
);

export const fetchProfessionalByIdAsync = createAsyncThunk(
  'professional/fetchProfessionalById',
  async (professionalId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(getProfessionalByIdUrl(professionalId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch professional');
    }
  }
);

export const fetchProfessionalByUserIdAsync = createAsyncThunk(
  'professional/fetchProfessionalByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${getProfessionByUserIdUrl}/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch professional profile');
    }
  }
);

export const fetchSectorsAsync = createAsyncThunk(
  'professional/fetchSectors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(sectorUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sectors');
    }
  }
);

export const fetchProfessionsAsync = createAsyncThunk(
  'professional/fetchProfessions',
  async (params: { sectorId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(professionalUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch professions');
    }
  }
);

export const fetchProfessionByIdAsync = createAsyncThunk(
  'professional/fetchProfessionById',
  async (professionId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(getProfessionByIdUrl(professionId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profession');
    }
  }
);

export const createProfessionAsync = createAsyncThunk(
  'professional/createProfession',
  async (professionData: Omit<Profession, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(createProfessionUrl, professionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create profession');
    }
  }
);

export const updateProfessionAsync = createAsyncThunk(
  'professional/updateProfession',
  async ({ id, data }: { id: string; data: Partial<Profession> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(updateProfessionUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profession');
    }
  }
);

export const deleteProfessionAsync = createAsyncThunk(
  'professional/deleteProfession',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteProfessionUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete profession');
    }
  }
);

export const fetchCooperationsAsync = createAsyncThunk(
  'professional/fetchCooperations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(getCooperatesUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cooperations');
    }
  }
);

export const updateProfessionalProfileAsync = createAsyncThunk(
  'professional/updateProfile',
  async ({ professionalId, data }: { professionalId: string; data: Partial<Professional> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/professionals/${professionalId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update professional profile');
    }
  }
);

export const updateAvailabilityAsync = createAsyncThunk(
  'professional/updateAvailability',
  async ({ professionalId, availability }: { professionalId: string; availability: Professional['availability'] }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/professionals/${professionalId}/availability`, { availability });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update availability');
    }
  }
);

// Slice
const professionalSlice = createSlice({
  name: 'professional',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProfessional: (state, action: PayloadAction<Professional | null>) => {
      state.currentProfessional = action.payload;
    },
    clearCurrentProfessional: (state) => {
      state.currentProfessional = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ProfessionalState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateMyProfile: (state, action: PayloadAction<Partial<Professional>>) => {
      if (state.myProfessionalProfile) {
        state.myProfessionalProfile = { ...state.myProfessionalProfile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Professionals
    builder
      .addCase(fetchProfessionalsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfessionalsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.professionals = action.payload.data || action.payload.professionals || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProfessionalsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Professional by ID
    builder
      .addCase(fetchProfessionalByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfessionalByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfessional = action.payload.data || action.payload.professional;
      })
      .addCase(fetchProfessionalByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Professional by User ID
    builder
      .addCase(fetchProfessionalByUserIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfessionalByUserIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProfessionalProfile = action.payload.data || action.payload.professional;
      })
      .addCase(fetchProfessionalByUserIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Sectors
    builder
      .addCase(fetchSectorsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectorsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sectors = action.payload.data || action.payload.sectors || [];
      })
      .addCase(fetchSectorsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Professions
    builder
      .addCase(fetchProfessionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfessionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.professions = action.payload.data || action.payload.professions || [];
      })
      .addCase(fetchProfessionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Profession by ID
    builder
      .addCase(fetchProfessionByIdAsync.fulfilled, (state, action) => {
        const profession = action.payload.data || action.payload.profession;
        if (profession) {
          const index = state.professions.findIndex(p => p.id === profession.id);
          if (index !== -1) {
            state.professions[index] = profession;
          } else {
            state.professions.push(profession);
          }
        }
      });

    // Create Profession
    builder
      .addCase(createProfessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProfessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const profession = action.payload.data || action.payload.profession;
        if (profession) {
          state.professions.push(profession);
        }
      })
      .addCase(createProfessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profession
    builder
      .addCase(updateProfessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.profession;
        if (updated) {
          const index = state.professions.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            state.professions[index] = updated;
          }
        }
      })
      .addCase(updateProfessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Profession
    builder
      .addCase(deleteProfessionAsync.fulfilled, (state, action) => {
        state.professions = state.professions.filter(p => p.id !== action.payload);
      });

    // Fetch Cooperations
    builder
      .addCase(fetchCooperationsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCooperationsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cooperations = action.payload.data || action.payload.cooperations || [];
      })
      .addCase(fetchCooperationsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Professional Profile
    builder
      .addCase(updateProfessionalProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfessionalProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.professional;
        if (updated) {
          if (state.myProfessionalProfile?.id === updated.id) {
            state.myProfessionalProfile = updated;
          }
          if (state.currentProfessional?.id === updated.id) {
            state.currentProfessional = updated;
          }
          const index = state.professionals.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            state.professionals[index] = updated;
          }
        }
      })
      .addCase(updateProfessionalProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Availability
    builder
      .addCase(updateAvailabilityAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.professional;
        if (updated) {
          if (state.myProfessionalProfile?.id === updated.id) {
            state.myProfessionalProfile.availability = updated.availability;
          }
          if (state.currentProfessional?.id === updated.id) {
            state.currentProfessional.availability = updated.availability;
          }
          const index = state.professionals.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            state.professionals[index].availability = updated.availability;
          }
        }
      });
  },
});

export const { 
  clearError, 
  setCurrentProfessional, 
  clearCurrentProfessional, 
  setFilters, 
  clearFilters, 
  updateMyProfile 
} = professionalSlice.actions;

export default professionalSlice.reducer;
