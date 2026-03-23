import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../utilizes/endpoints';

// Types
export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastSeen?: string;
  isOnline: boolean;
  isFavorite: boolean;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  contactIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface ContactState {
  contacts: Contact[];
  groups: ContactGroup[];
  requests: ContactRequest[];
  sentRequests: ContactRequest[];
  currentContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  searchResults: Contact[];
  isSearching: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: string;
    isFavorite?: boolean;
    tags?: string[];
    search?: string;
  };
  onlineContacts: string[];
}

// Initial state
const initialState: ContactState = {
  contacts: [],
  groups: [],
  requests: [],
  sentRequests: [],
  currentContact: null,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  onlineContacts: [],
};

// Async thunks
export const fetchContactsAsync = createAsyncThunk(
  'contacts/fetchContacts',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts`, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contacts');
    }
  }
);

export const addContactAsync = createAsyncThunk(
  'contacts/addContact',
  async (contactData: { userId: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contacts/add`, contactData);
      return response.data.data || response.data.contact;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add contact');
    }
  }
);

export const removeContactAsync = createAsyncThunk(
  'contacts/removeContact',
  async (contactId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/contacts/remove/${contactId}`);
      return contactId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove contact');
    }
  }
);

export const updateContactAsync = createAsyncThunk(
  'contacts/updateContact',
  async ({ contactId, data }: { contactId: string; data: Partial<Contact> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/${contactId}`, data);
      return response.data.data || response.data.contact;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact');
    }
  }
);

export const searchContactsAsync = createAsyncThunk(
  'contacts/searchContacts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts/search`, { params: { q: query } });
      return response.data.data || response.data.contacts || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search contacts');
    }
  }
);

export const fetchContactRequestsAsync = createAsyncThunk(
  'contacts/fetchContactRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts/requests`);
      return response.data.data || response.data.requests || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact requests');
    }
  }
);

export const acceptContactRequestAsync = createAsyncThunk(
  'contacts/acceptContactRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/requests/${requestId}/accept`);
      return response.data.data || response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept contact request');
    }
  }
);

export const rejectContactRequestAsync = createAsyncThunk(
  'contacts/rejectContactRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/requests/${requestId}/reject`);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject contact request');
    }
  }
);

export const blockContactAsync = createAsyncThunk(
  'contacts/blockContact',
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/${contactId}/block`);
      return response.data.data || response.data.contact;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block contact');
    }
  }
);

export const unblockContactAsync = createAsyncThunk(
  'contacts/unblockContact',
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/${contactId}/unblock`);
      return response.data.data || response.data.contact;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock contact');
    }
  }
);

export const toggleFavoriteAsync = createAsyncThunk(
  'contacts/toggleFavorite',
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/${contactId}/favorite`);
      return response.data.data || response.data.contact;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

export const createContactGroupAsync = createAsyncThunk(
  'contacts/createContactGroup',
  async (groupData: Omit<ContactGroup, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contacts/groups`, groupData);
      return response.data.data || response.data.group;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create contact group');
    }
  }
);

export const updateContactGroupAsync = createAsyncThunk(
  'contacts/updateContactGroup',
  async ({ groupId, data }: { groupId: string; data: Partial<ContactGroup> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/groups/${groupId}`, data);
      return response.data.data || response.data.group;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact group');
    }
  }
);

export const deleteContactGroupAsync = createAsyncThunk(
  'contacts/deleteContactGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/contacts/groups/${groupId}`);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete contact group');
    }
  }
);

// Slice
const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentContact: (state, action: PayloadAction<Contact | null>) => {
      state.currentContact = action.payload;
    },
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ContactState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
    updateOnlineStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      const { userId, isOnline } = action.payload;
      const contactIndex = state.contacts.findIndex(contact => contact.userId === userId);
      if (contactIndex !== -1) {
        state.contacts[contactIndex].isOnline = isOnline;
      }
      
      if (isOnline) {
        if (!state.onlineContacts.includes(userId)) {
          state.onlineContacts.push(userId);
        }
      } else {
        state.onlineContacts = state.onlineContacts.filter(id => id !== userId);
      }
    },
    updateLastSeen: (state, action: PayloadAction<{ userId: string; lastSeen: string }>) => {
      const { userId, lastSeen } = action.payload;
      const contactIndex = state.contacts.findIndex(contact => contact.userId === userId);
      if (contactIndex !== -1) {
        state.contacts[contactIndex].lastSeen = lastSeen;
      }
    },
    addContactToGroup: (state, action: PayloadAction<{ groupId: string; contactId: string }>) => {
      const { groupId, contactId } = action.payload;
      const groupIndex = state.groups.findIndex(group => group.id === groupId);
      if (groupIndex !== -1 && !state.groups[groupIndex].contactIds.includes(contactId)) {
        state.groups[groupIndex].contactIds.push(contactId);
      }
    },
    removeContactFromGroup: (state, action: PayloadAction<{ groupId: string; contactId: string }>) => {
      const { groupId, contactId } = action.payload;
      const groupIndex = state.groups.findIndex(group => group.id === groupId);
      if (groupIndex !== -1) {
        state.groups[groupIndex].contactIds = state.groups[groupIndex].contactIds.filter(id => id !== contactId);
      }
    },
    resetContactState: (state) => {
      state.currentContact = null;
      state.searchResults = [];
      state.isSearching = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Contacts
    builder
      .addCase(fetchContactsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContactsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload.data || action.payload.contacts || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchContactsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Contact
    builder
      .addCase(addContactAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addContactAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const contact = action.payload;
        if (contact) {
          state.contacts.push(contact);
        }
      })
      .addCase(addContactAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove Contact
    builder
      .addCase(removeContactAsync.fulfilled, (state, action) => {
        const contactId = action.payload;
        state.contacts = state.contacts.filter(contact => contact.id !== contactId);
        if (state.currentContact?.id === contactId) {
          state.currentContact = null;
        }
      });

    // Update Contact
    builder
      .addCase(updateContactAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.contacts.findIndex(contact => contact.id === updated.id);
          if (index !== -1) {
            state.contacts[index] = updated;
          }
          if (state.currentContact?.id === updated.id) {
            state.currentContact = updated;
          }
        }
      });

    // Search Contacts
    builder
      .addCase(searchContactsAsync.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchContactsAsync.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchContactsAsync.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Fetch Contact Requests
    builder
      .addCase(fetchContactRequestsAsync.fulfilled, (state, action) => {
        state.requests = action.payload;
      });

    // Accept Contact Request
    builder
      .addCase(acceptContactRequestAsync.fulfilled, (state, action) => {
        const request = action.payload;
        if (request) {
          // Remove from requests
          state.requests = state.requests.filter(req => req.id !== request.id);
          // Add to contacts if not already there
          const contact = {
            id: request.id,
            userId: request.senderId === request.receiverId ? request.receiverId : request.senderId,
            name: '', // Will be populated by backend
            status: 'active' as const,
            isOnline: false,
            isFavorite: false,
            createdAt: request.createdAt,
            updatedAt: new Date().toISOString(),
          };
          if (!state.contacts.find(c => c.userId === contact.userId)) {
            state.contacts.push(contact);
          }
        }
      });

    // Reject Contact Request
    builder
      .addCase(rejectContactRequestAsync.fulfilled, (state, action) => {
        const requestId = action.payload;
        state.requests = state.requests.filter(req => req.id !== requestId);
      });

    // Block/Unblock Contact
    builder
      .addCase(blockContactAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.contacts.findIndex(contact => contact.id === updated.id);
          if (index !== -1) {
            state.contacts[index] = updated;
          }
        }
      })
      .addCase(unblockContactAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.contacts.findIndex(contact => contact.id === updated.id);
          if (index !== -1) {
            state.contacts[index] = updated;
          }
        }
      });

    // Toggle Favorite
    builder
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.contacts.findIndex(contact => contact.id === updated.id);
          if (index !== -1) {
            state.contacts[index] = updated;
          }
        }
      });

    // Contact Groups
    builder
      .addCase(createContactGroupAsync.fulfilled, (state, action) => {
        const group = action.payload;
        if (group) {
          state.groups.push(group);
        }
      })
      .addCase(updateContactGroupAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.groups.findIndex(group => group.id === updated.id);
          if (index !== -1) {
            state.groups[index] = updated;
          }
        }
      })
      .addCase(deleteContactGroupAsync.fulfilled, (state, action) => {
        const groupId = action.payload;
        state.groups = state.groups.filter(group => group.id !== groupId);
      });
  },
});

export const {
  clearError,
  setCurrentContact,
  clearCurrentContact,
  setFilters,
  clearFilters,
  clearSearchResults,
  updateOnlineStatus,
  updateLastSeen,
  addContactToGroup,
  removeContactFromGroup,
  resetContactState,
} = contactSlice.actions;

export default contactSlice.reducer;
