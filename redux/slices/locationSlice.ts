import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  addLocationUrl,
  updateLocationUrl,
  getLocationByIdUrl,
  deleteLocationUrl,
  getMyLocationsUrl,
  findPersonsNearbyUrl
} from '../../utilizes/endpoints';

// Types
export interface Location {
  id: string;
  userId: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault: boolean;
  isCurrent: boolean;
  landmark?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NearbyPerson {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: string;
  distance: number;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  lastSeen?: string;
  rating?: number;
  profession?: string;
}

export interface LocationState {
  locations: Location[];
  currentLocation: Location | null;
  defaultLocation: Location | null;
  nearbyPersons: NearbyPerson[];
  isLoading: boolean;
  error: string | null;
  isTrackingLocation: boolean;
  locationPermission: 'granted' | 'denied' | 'not_determined';
  lastKnownPosition: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  searchRadius: number; // in kilometers
  filters: {
    role?: string;
    maxDistance?: number;
    isOnline?: boolean;
  };
}

// Initial state
const initialState: LocationState = {
  locations: [],
  currentLocation: null,
  defaultLocation: null,
  nearbyPersons: [],
  isLoading: false,
  error: null,
  isTrackingLocation: false,
  locationPermission: 'not_determined',
  lastKnownPosition: null,
  searchRadius: 5,
  filters: {},
};

// Async thunks
export const fetchMyLocationsAsync = createAsyncThunk(
  'location/fetchMyLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(getMyLocationsUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch locations');
    }
  }
);

export const addLocationAsync = createAsyncThunk(
  'location/addLocation',
  async (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(addLocationUrl, locationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add location');
    }
  }
);

export const updateLocationAsync = createAsyncThunk(
  'location/updateLocation',
  async ({ id, data }: { id: string; data: Partial<Location> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(updateLocationUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

export const deleteLocationAsync = createAsyncThunk(
  'location/deleteLocation',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteLocationUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete location');
    }
  }
);

export const fetchLocationByIdAsync = createAsyncThunk(
  'location/fetchLocationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(getLocationByIdUrl(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch location');
    }
  }
);

export const findNearbyPersonsAsync = createAsyncThunk(
  'location/findNearbyPersons',
  async (params: { latitude: number; longitude: number; radius?: number; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.post(findPersonsNearbyUrl, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to find nearby persons');
    }
  }
);

export const setDefaultLocationAsync = createAsyncThunk(
  'location/setDefaultLocation',
  async (locationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${updateLocationUrl(locationId)}`, { isDefault: true });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default location');
    }
  }
);

export const setCurrentLocationAsync = createAsyncThunk(
  'location/setCurrentLocation',
  async ({ latitude, longitude, address }: { latitude: number; longitude: number; address?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/location/current', { latitude, longitude, address });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set current location');
    }
  }
);

// Slice
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLocation: (state, action: PayloadAction<Location | null>) => {
      state.currentLocation = action.payload;
    },
    setDefaultLocation: (state, action: PayloadAction<Location | null>) => {
      state.defaultLocation = action.payload;
    },
    setLocationPermission: (state, action: PayloadAction<LocationState['locationPermission']>) => {
      state.locationPermission = action.payload;
    },
    setTrackingLocation: (state, action: PayloadAction<boolean>) => {
      state.isTrackingLocation = action.payload;
    },
    updateLastKnownPosition: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.lastKnownPosition = {
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<LocationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearNearbyPersons: (state) => {
      state.nearbyPersons = [];
    },
    updateNearbyPersonStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      const { userId, isOnline } = action.payload;
      const person = state.nearbyPersons.find(p => p.userId === userId);
      if (person) {
        person.isOnline = isOnline;
        person.lastSeen = isOnline ? undefined : new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch My Locations
    builder
      .addCase(fetchMyLocationsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLocationsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload.data || action.payload.locations || [];
        
        // Set default and current locations
        const defaultLoc = state.locations.find(loc => loc.isDefault);
        const currentLoc = state.locations.find(loc => loc.isCurrent);
        state.defaultLocation = defaultLoc || null;
        state.currentLocation = currentLoc || null;
      })
      .addCase(fetchMyLocationsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Location
    builder
      .addCase(addLocationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addLocationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const location = action.payload.data || action.payload.location;
        if (location) {
          state.locations.push(location);
          if (location.isDefault) {
            state.defaultLocation = location;
          }
          if (location.isCurrent) {
            state.currentLocation = location;
          }
        }
      })
      .addCase(addLocationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Location
    builder
      .addCase(updateLocationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLocationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.location;
        if (updated) {
          const index = state.locations.findIndex(loc => loc.id === updated.id);
          if (index !== -1) {
            state.locations[index] = updated;
            
            // Update default and current if needed
            if (updated.isDefault) {
              state.defaultLocation = updated;
              // Remove default flag from other locations
              state.locations.forEach((loc, idx) => {
                if (idx !== index && loc.isDefault) {
                  loc.isDefault = false;
                }
              });
            }
            if (updated.isCurrent) {
              state.currentLocation = updated;
              // Remove current flag from other locations
              state.locations.forEach((loc, idx) => {
                if (idx !== index && loc.isCurrent) {
                  loc.isCurrent = false;
                }
              });
            }
          }
        }
      })
      .addCase(updateLocationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Location
    builder
      .addCase(deleteLocationAsync.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.locations = state.locations.filter(loc => loc.id !== deletedId);
        
        // Update default and current if they were deleted
        if (state.defaultLocation?.id === deletedId) {
          state.defaultLocation = null;
        }
        if (state.currentLocation?.id === deletedId) {
          state.currentLocation = null;
        }
      });

    // Fetch Location by ID
    builder
      .addCase(fetchLocationByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocationByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const location = action.payload.data || action.payload.location;
        if (location) {
          const index = state.locations.findIndex(loc => loc.id === location.id);
          if (index !== -1) {
            state.locations[index] = location;
          } else {
            state.locations.push(location);
          }
        }
      })
      .addCase(fetchLocationByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Find Nearby Persons
    builder
      .addCase(findNearbyPersonsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(findNearbyPersonsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyPersons = action.payload.data || action.payload.persons || [];
      })
      .addCase(findNearbyPersonsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Set Default Location
    builder
      .addCase(setDefaultLocationAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.location;
        if (updated) {
          // Remove default flag from all locations
          state.locations.forEach(loc => loc.isDefault = false);
          
          // Set new default
          const index = state.locations.findIndex(loc => loc.id === updated.id);
          if (index !== -1) {
            state.locations[index].isDefault = true;
            state.defaultLocation = state.locations[index];
          }
        }
      });

    // Set Current Location
    builder
      .addCase(setCurrentLocationAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.location;
        if (updated) {
          // Remove current flag from all locations
          state.locations.forEach(loc => loc.isCurrent = false);
          
          // Set new current
          const index = state.locations.findIndex(loc => loc.id === updated.id);
          if (index !== -1) {
            state.locations[index].isCurrent = true;
            state.currentLocation = state.locations[index];
          }
          
          // Update last known position
          state.lastKnownPosition = {
            latitude: updated.latitude,
            longitude: updated.longitude,
            timestamp: new Date().toISOString(),
          };
        }
      });
  },
});

export const {
  clearError,
  setCurrentLocation,
  setDefaultLocation,
  setLocationPermission,
  setTrackingLocation,
  updateLastKnownPosition,
  setSearchRadius,
  setFilters,
  clearFilters,
  clearNearbyPersons,
  updateNearbyPersonStatus,
} = locationSlice.actions;

export default locationSlice.reducer;
