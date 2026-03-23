import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, JOBS } from '../../utilizes/endpoints';

// Types
export interface Material {
  id: number;
  description: string;
  quantity: number;
  unit?: string;
  price: number;
  subTotal?: number;
  jobId: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'APPROVED' | 'DISPUTED' | 'CANCELLED' | 'DECLINED' | 'REJECTED';
  payStatus: 'unpaid' | 'paid' | 'refunded' | 'released';
  accepted: boolean;
  approved: boolean;
  mode?: 'VIRTUAL' | 'PHYSICAL';
  clientId: string;
  professionalId: string;
  workmanship?: number;
  materialsCost?: number;
  isMaterial?: boolean;
  durationUnit?: string;
  durationValue?: number;
  fullAddress?: string;
  state?: string;
  lga?: string;
  paymentRef?: string;
  reason?: string;
  materials?: Material[];
  client?: any;
  professional?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  title: string;
  description: string;
  status: Job['status'];
  workmanship?: number;
  materialsCost?: number;
  materials: Material[];
  createdAt: string;
  updatedAt: string;
}

export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  latestJobs: Job[];
  myJobs: Job[];
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  latestJobs: [],
  myJobs: [],
  invoices: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchJobsAsync = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${JOBS.LIST}`, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchLatestJobsAsync = createAsyncThunk(
  'jobs/fetchLatestJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${JOBS.LATEST}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch latest jobs');
    }
  }
);

export const fetchJobByIdAsync = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${JOBS.GET_BY_ID(jobId)}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job');
    }
  }
);

export const respondToJobAsync = createAsyncThunk(
  'jobs/respondToJob',
  async ({ jobId, accepted }: { jobId: string; accepted: boolean }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}${JOBS.RESPOND(jobId)}`, { accepted });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to job');
    }
  }
);

export const completeJobAsync = createAsyncThunk(
  'jobs/completeJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${JOBS.COMPLETE(jobId)}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete job');
    }
  }
);

export const approveJobAsync = createAsyncThunk(
  'jobs/approveJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${JOBS.APPROVE(jobId)}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve job');
    }
  }
);

export const disputeJobAsync = createAsyncThunk(
  'jobs/disputeJob',
  async ({ jobId, reason, description }: { jobId: string; reason: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${JOBS.DISPUTE(jobId)}`, { reason, description });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dispute job');
    }
  }
);

export const cancelJobAsync = createAsyncThunk(
  'jobs/cancelJob',
  async ({ jobId, reason }: { jobId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${JOBS.CANCEL(jobId)}`, { reason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel job');
    }
  }
);

export const updateJobAsync = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, updates }: { jobId: string; updates: Partial<Job> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}${JOBS.UPDATE(jobId)}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update job');
    }
  }
);

export interface GenerateInvoiceParams {
  jobId: number;
  workmanship: number;
  durationUnit: string;
  durationValue: number;
  materials?: { description: string; quantity: number; unit?: string; price: number }[];
}

export const generateInvoiceAsync = createAsyncThunk(
  'jobs/generateInvoice',
  async (params: GenerateInvoiceParams, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${JOBS.INVOICE}`, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice');
    }
  }
);

export interface UpdateInvoiceParams {
  jobId: string;
  workmanship?: number;
  durationUnit?: string;
  durationValue?: number;
  materials?: { id?: number; description: string; quantity: number; unit?: string; price: number }[];
}

export const updateInvoiceAsync = createAsyncThunk(
  'jobs/updateInvoice',
  async ({ jobId, ...data }: UpdateInvoiceParams, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}${JOBS.INVOICE_BY_ID(jobId)}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export interface CreateJobParams {
  title: string;
  description: string;
  professionalId: string;
  mode: 'VIRTUAL' | 'PHYSICAL';
  state?: string;
  lga?: string;
  fullAddress?: string;
}

export const createJobAsync = createAsyncThunk(
  'jobs/createJob',
  async (params: CreateJobParams, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${JOBS.CREATE}`, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create job');
    }
  }
);

export const fetchInvoiceAsync = createAsyncThunk(
  'jobs/fetchInvoice',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${JOBS.VIEW_INVOICE(jobId)}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

// Slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    updateJobStatus: (state, action: PayloadAction<{ jobId: number; status: Job['status'] }>) => {
      const { jobId, status } = action.payload;
      const jobIndex = state.jobs.findIndex(job => job.id === jobId);
      if (jobIndex !== -1) {
        state.jobs[jobIndex].status = status;
      }
      if (state.currentJob?.id === jobId) {
        state.currentJob.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Jobs
    builder
      .addCase(fetchJobsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.data || action.payload.jobs || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchJobsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Latest Jobs
    builder
      .addCase(fetchLatestJobsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLatestJobsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latestJobs = action.payload.data || action.payload.jobs || [];
      })
      .addCase(fetchLatestJobsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Job by ID
    builder
      .addCase(fetchJobByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload.data || action.payload.job;
      })
      .addCase(fetchJobByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Respond to Job
    builder
      .addCase(respondToJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(respondToJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentJob) {
          state.currentJob.status = action.payload.data?.status || state.currentJob.status;
        }
      })
      .addCase(respondToJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete Job
    builder
      .addCase(completeJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentJob) {
          state.currentJob.status = 'COMPLETED';
        }
      })
      .addCase(completeJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Approve Job
    builder
      .addCase(approveJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentJob) {
          state.currentJob.status = 'APPROVED';
        }
      })
      .addCase(approveJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Dispute Job
    builder
      .addCase(disputeJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disputeJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentJob) {
          state.currentJob.status = 'DISPUTED';
        }
      })
      .addCase(disputeJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Job
    builder
      .addCase(cancelJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentJob) {
          state.currentJob.status = 'CANCELLED';
        }
      })
      .addCase(cancelJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Job
    builder
      .addCase(updateJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentJob) {
          state.currentJob = { ...state.currentJob, ...action.payload.data };
        }
      })
      .addCase(updateJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate Invoice
    builder
      .addCase(generateInvoiceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInvoiceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const invoice = action.payload.data || action.payload.invoice;
        if (invoice) {
          state.invoices.push(invoice);
        }
      })
      .addCase(generateInvoiceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Job
    builder
      .addCase(createJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const job = action.payload.data || action.payload.job;
        if (job) {
          state.jobs.unshift(job);
        }
      })
      .addCase(createJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Invoice
    builder
      .addCase(updateInvoiceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInvoiceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedJob = action.payload.data?.job || action.payload.job;
        if (updatedJob && state.currentJob?.id === updatedJob.id) {
          state.currentJob = { ...state.currentJob, ...updatedJob };
        }
      })
      .addCase(updateInvoiceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Invoice
    builder
      .addCase(fetchInvoiceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const invoice = action.payload.data || action.payload.invoice;
        if (invoice) {
          const index = state.invoices.findIndex(inv => inv.id === invoice.id);
          if (index !== -1) {
            state.invoices[index] = invoice;
          } else {
            state.invoices.push(invoice);
          }
        }
      })
      .addCase(fetchInvoiceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentJob, clearCurrentJob, updateJobStatus } = jobsSlice.actions;
export default jobsSlice.reducer;

// ── Helpers: distinguish PENDING sub-states ──────────────────────────

export type JobSubStatus =
  | 'awaiting_response'   // PENDING, not accepted
  | 'awaiting_invoice'    // PENDING, accepted, no workmanship set
  | 'awaiting_payment'    // PENDING, accepted, invoice raised but unpaid
  | Job['status'];        // all other statuses pass through as-is

export const getJobSubStatus = (job: Job): JobSubStatus => {
  if (job.status === 'PENDING') {
    if (!job.accepted) return 'awaiting_response';
    if (!job.workmanship) return 'awaiting_invoice';
    return 'awaiting_payment';
  }
  return job.status;
};

// ── Selectors ────────────────────────────────────────────────────────

export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectCurrentJob = (state: { jobs: JobsState }) => state.jobs.currentJob;
export const selectJobsLoading = (state: { jobs: JobsState }) => state.jobs.isLoading;
export const selectJobsError = (state: { jobs: JobsState }) => state.jobs.error;
export const selectInvoices = (state: { jobs: JobsState }) => state.jobs.invoices;
