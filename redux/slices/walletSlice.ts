import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { viewWalletUrl, debitWallet, setPinUrl, resetPinUrl } from '../../utilizes/endpoints';
import { transactionService, Transaction as TransactionType, TransactionFilters } from '../../services/transactionService';

// Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  previousBalance: number;
  pin?: string;
  isPinSet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface WalletState {
  wallet: Wallet | null;
  transactions: TransactionType[];
  balance: number;
  isLoading: boolean;
  error: string | null;
  pinSet: boolean;
  lastTransaction: TransactionType | null;
  transactionFilters: TransactionFilters;
  transactionStats: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    totalCredits: number;
    totalDebits: number;
  } | null;
}

// Initial state
const initialState: WalletState = {
  wallet: null,
  transactions: [],
  balance: 0,
  isLoading: false,
  error: null,
  pinSet: false,
  lastTransaction: null,
  transactionFilters: {
    status: 'all',
    type: 'all',
    page: 1,
    limit: 20,
  },
  transactionStats: null,
};

// Async thunks
export const fetchWalletAsync = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(viewWalletUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
    }
  }
);

export const createWalletAsync = createAsyncThunk(
  'wallet/createWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/create-wallet');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create wallet');
    }
  }
);

export const creditWalletAsync = createAsyncThunk(
  'wallet/creditWallet',
  async ({ amount, description }: { amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/credit-wallet', { amount, description });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to credit wallet');
    }
  }
);

export const debitWalletAsync = createAsyncThunk(
  'wallet/debitWallet',
  async ({ amount, description }: { amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(debitWallet, { amount, description });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to debit wallet');
    }
  }
);

export const setPinAsync = createAsyncThunk(
  'wallet/setPin',
  async ({ pin, confirmPin }: { pin: string; confirmPin: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(setPinUrl, { pin, confirmPin });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set PIN');
    }
  }
);

export const resetPinAsync = createAsyncThunk(
  'wallet/resetPin',
  async ({ oldPin, newPin, confirmPin }: { oldPin?: string; newPin: string; confirmPin: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(resetPinUrl, { oldPin, newPin, confirmPin });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset PIN');
    }
  }
);

// Fetch transactions
export const fetchTransactionsAsync = createAsyncThunk(
  'wallet/fetchTransactions',
  async (filters: TransactionFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

// Fetch transaction statistics
export const fetchTransactionStatsAsync = createAsyncThunk(
  'wallet/fetchTransactionStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await transactionService.getTransactionStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transaction stats');
    }
  }
);

export const forgotPinAsync = createAsyncThunk(
  'wallet/forgotPin',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/forgot-pin', { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process PIN reset request');
    }
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
      if (state.wallet) {
        state.wallet.balance = action.payload;
      }
    },
    setLastTransaction: (state, action: PayloadAction<TransactionType>) => {
      state.lastTransaction = action.payload;
    },
    clearLastTransaction: (state) => {
      state.lastTransaction = null;
    },
    setTransactionFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.transactionFilters = { ...state.transactionFilters, ...action.payload };
    },
    clearTransactionFilters: (state) => {
      state.transactionFilters = {
        status: 'all',
        type: 'all',
        page: 1,
        limit: 20,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch Wallet
    builder
      .addCase(fetchWalletAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const wallet = action.payload.data || action.payload.wallet;
        if (wallet) {
          state.wallet = wallet;
          state.balance = wallet.balance;
          state.pinSet = wallet.isPinSet || !!wallet.pin;
        }
      })
      .addCase(fetchWalletAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Wallet
    builder
      .addCase(createWalletAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWalletAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const wallet = action.payload.data || action.payload.wallet;
        if (wallet) {
          state.wallet = wallet;
          state.balance = wallet.balance;
          state.pinSet = wallet.isPinSet || !!wallet.pin;
        }
      })
      .addCase(createWalletAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Credit Wallet
    builder
      .addCase(creditWalletAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(creditWalletAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const transaction = action.payload.data || action.payload.transaction;
        if (transaction) {
          state.transactions.unshift(transaction);
          state.lastTransaction = transaction;
          if (transaction.type === 'credit') {
            state.balance += transaction.amount;
            if (state.wallet) {
              state.wallet.balance = state.balance;
            }
          }
        }
      })
      .addCase(creditWalletAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Debit Wallet
    builder
      .addCase(debitWalletAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(debitWalletAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const transaction = action.payload.data || action.payload.transaction;
        if (transaction) {
          state.transactions.unshift(transaction);
          state.lastTransaction = transaction;
          if (transaction.type === 'debit') {
            state.balance -= transaction.amount;
            if (state.wallet) {
              state.wallet.balance = state.balance;
            }
          }
        }
      })
      .addCase(debitWalletAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Set PIN
    builder
      .addCase(setPinAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setPinAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pinSet = true;
        if (state.wallet) {
          state.wallet.isPinSet = true;
        }
      })
      .addCase(setPinAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset PIN
    builder
      .addCase(resetPinAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPinAsync.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetPinAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forgot PIN
    builder
      .addCase(forgotPinAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPinAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPinAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Transactions
    builder
      .addCase(fetchTransactionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data || [];
      })
      .addCase(fetchTransactionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Transaction Stats
    builder
      .addCase(fetchTransactionStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactionStats = action.payload;
      })
      .addCase(fetchTransactionStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateBalance, setLastTransaction, clearLastTransaction, setTransactionFilters, clearTransactionFilters } = walletSlice.actions;
export default walletSlice.reducer;
