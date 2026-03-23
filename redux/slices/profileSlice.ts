import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { userDetailsgeneralUrl, educationUrl, certificationUrl, experienceUrl, portfolioUrl, locationUrl, getLocationUrl } from '../../utilizes/endpoints';

// Types
export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  state?: string;
  lga?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  profileId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  createdAt: string;
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt: string;
}

export interface Experience {
  id: string;
  profileId: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  description?: string;
  achievements?: string[];
  createdAt: string;
}

export interface Portfolio {
  id: string;
  profileId: string;
  title: string;
  description: string;
  images?: string[];
  projectUrl?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  status: 'ongoing' | 'completed';
  createdAt: string;
}

export interface Location {
  id: string;
  userId: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ProfileState {
  profile: Profile | null;
  education: Education[];
  certifications: Certification[];
  experiences: Experience[];
  portfolios: Portfolio[];
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  education: [],
  certifications: [],
  experiences: [],
  portfolios: [],
  locations: [],
  isLoading: false,
  error: null,
  updateSuccess: false,
};

// Async thunks
export const fetchProfileAsync = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(userDetailsgeneralUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<Profile>, { rejectWithValue }) => {
    try {
      const response = await axios.post(userDetailsgeneralUrl, profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchEducationAsync = createAsyncThunk(
  'profile/fetchEducation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(educationUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch education');
    }
  }
);

export const addEducationAsync = createAsyncThunk(
  'profile/addEducation',
  async (educationData: Omit<Education, 'id' | 'profileId' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(educationUrl, educationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add education');
    }
  }
);

export const updateEducationAsync = createAsyncThunk(
  'profile/updateEducation',
  async ({ id, data }: { id: string; data: Partial<Education> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${educationUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update education');
    }
  }
);

export const deleteEducationAsync = createAsyncThunk(
  'profile/deleteEducation',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${educationUrl}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete education');
    }
  }
);

export const fetchCertificationsAsync = createAsyncThunk(
  'profile/fetchCertifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(certificationUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch certifications');
    }
  }
);

export const addCertificationAsync = createAsyncThunk(
  'profile/addCertification',
  async (certificationData: Omit<Certification, 'id' | 'profileId' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(certificationUrl, certificationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add certification');
    }
  }
);

export const updateCertificationAsync = createAsyncThunk(
  'profile/updateCertification',
  async ({ id, data }: { id: string; data: Partial<Certification> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${certificationUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update certification');
    }
  }
);

export const deleteCertificationAsync = createAsyncThunk(
  'profile/deleteCertification',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${certificationUrl}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete certification');
    }
  }
);

export const fetchExperiencesAsync = createAsyncThunk(
  'profile/fetchExperiences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(experienceUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch experiences');
    }
  }
);

export const addExperienceAsync = createAsyncThunk(
  'profile/addExperience',
  async (experienceData: Omit<Experience, 'id' | 'profileId' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(experienceUrl, experienceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add experience');
    }
  }
);

export const updateExperienceAsync = createAsyncThunk(
  'profile/updateExperience',
  async ({ id, data }: { id: string; data: Partial<Experience> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${experienceUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update experience');
    }
  }
);

export const deleteExperienceAsync = createAsyncThunk(
  'profile/deleteExperience',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${experienceUrl}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete experience');
    }
  }
);

export const fetchPortfoliosAsync = createAsyncThunk(
  'profile/fetchPortfolios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(portfolioUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolios');
    }
  }
);

export const addPortfolioAsync = createAsyncThunk(
  'profile/addPortfolio',
  async (portfolioData: Omit<Portfolio, 'id' | 'profileId' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(portfolioUrl, portfolioData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add portfolio');
    }
  }
);

export const updatePortfolioAsync = createAsyncThunk(
  'profile/updatePortfolio',
  async ({ id, data }: { id: string; data: Partial<Portfolio> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${portfolioUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update portfolio');
    }
  }
);

export const deletePortfolioAsync = createAsyncThunk(
  'profile/deletePortfolio',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${portfolioUrl}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete portfolio');
    }
  }
);

export const fetchLocationsAsync = createAsyncThunk(
  'profile/fetchLocations',
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
  'profile/addLocation',
  async (locationData: Omit<Location, 'id' | 'userId' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(addLocationUrl, locationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add location');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUpdateSuccess: (state, action: PayloadAction<boolean>) => {
      state.updateSuccess = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.education = [];
      state.certifications = [];
      state.experiences = [];
      state.portfolios = [];
      state.locations = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || action.payload.profile;
      })
      .addCase(fetchProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.updateSuccess = true;
        state.profile = { ...state.profile, ...action.payload.data };
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      });

    // Education
    builder
      .addCase(fetchEducationAsync.fulfilled, (state, action) => {
        state.education = action.payload.data || action.payload.education || [];
      })
      .addCase(addEducationAsync.fulfilled, (state, action) => {
        const education = action.payload.data || action.payload.education;
        if (education) state.education.push(education);
      })
      .addCase(updateEducationAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.education;
        if (updated) {
          const index = state.education.findIndex(edu => edu.id === updated.id);
          if (index !== -1) state.education[index] = updated;
        }
      })
      .addCase(deleteEducationAsync.fulfilled, (state, action) => {
        state.education = state.education.filter(edu => edu.id !== action.payload);
      });

    // Certifications
    builder
      .addCase(fetchCertificationsAsync.fulfilled, (state, action) => {
        state.certifications = action.payload.data || action.payload.certifications || [];
      })
      .addCase(addCertificationAsync.fulfilled, (state, action) => {
        const certification = action.payload.data || action.payload.certification;
        if (certification) state.certifications.push(certification);
      })
      .addCase(updateCertificationAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.certification;
        if (updated) {
          const index = state.certifications.findIndex(cert => cert.id === updated.id);
          if (index !== -1) state.certifications[index] = updated;
        }
      })
      .addCase(deleteCertificationAsync.fulfilled, (state, action) => {
        state.certifications = state.certifications.filter(cert => cert.id !== action.payload);
      });

    // Experiences
    builder
      .addCase(fetchExperiencesAsync.fulfilled, (state, action) => {
        state.experiences = action.payload.data || action.payload.experiences || [];
      })
      .addCase(addExperienceAsync.fulfilled, (state, action) => {
        const experience = action.payload.data || action.payload.experience;
        if (experience) state.experiences.push(experience);
      })
      .addCase(updateExperienceAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.experience;
        if (updated) {
          const index = state.experiences.findIndex(exp => exp.id === updated.id);
          if (index !== -1) state.experiences[index] = updated;
        }
      })
      .addCase(deleteExperienceAsync.fulfilled, (state, action) => {
        state.experiences = state.experiences.filter(exp => exp.id !== action.payload);
      });

    // Portfolios
    builder
      .addCase(fetchPortfoliosAsync.fulfilled, (state, action) => {
        state.portfolios = action.payload.data || action.payload.portfolios || [];
      })
      .addCase(addPortfolioAsync.fulfilled, (state, action) => {
        const portfolio = action.payload.data || action.payload.portfolio;
        if (portfolio) state.portfolios.push(portfolio);
      })
      .addCase(updatePortfolioAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.portfolio;
        if (updated) {
          const index = state.portfolios.findIndex(port => port.id === updated.id);
          if (index !== -1) state.portfolios[index] = updated;
        }
      })
      .addCase(deletePortfolioAsync.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.filter(port => port.id !== action.payload);
      });

    // Locations
    builder
      .addCase(fetchLocationsAsync.fulfilled, (state, action) => {
        state.locations = action.payload.data || action.payload.locations || [];
      })
      .addCase(addLocationAsync.fulfilled, (state, action) => {
        const location = action.payload.data || action.payload.location;
        if (location) state.locations.push(location);
      });
  },
});

export const { clearError, setUpdateSuccess, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
