import axios from 'axios';
import { API_BASE_URL } from '../utilizes/endpoints';
import { store } from '../redux/store';

const getAuthHeader = () => {
  const token = store.getState().auth?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Transaction types based on backend schema
export interface Transaction {
  id: string;
  amount: string | number;
  type: 'debit' | 'credit';
  status: 'success' | 'failed' | 'pending';
  channel?: string;
  currency: string;
  timestamp: string;
  description?: string;
  reference?: string;
  jobId?: number;
  productTransactionId?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: number;
    title?: string;
    description?: string;
  };
  productTransaction?: {
    id: number;
    quantity: number;
    price: number;
    status: string;
    product?: {
      id: number;
      name: string;
      description?: string;
    };
  };
}

export interface TransactionFilters {
  status?: 'success' | 'failed' | 'pending' | 'all';
  type?: 'debit' | 'credit' | 'all';
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  status: boolean;
  message: string;
  data: Transaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class TransactionService {
  private baseUrl = API_BASE_URL;

  // Get all transactions for the authenticated user
  async getTransactions(filters?: TransactionFilters): Promise<TransactionResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== 'all') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${this.baseUrl}/transactions?${params.toString()}`,
        getAuthHeader()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      throw error.response?.data || { message: 'Failed to fetch transactions' };
    }
  }

  // Get a specific transaction by ID
  async getTransactionById(transactionId: string): Promise<{ status: boolean; message: string; data: Transaction }> {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions/${transactionId}`, getAuthHeader());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching transaction:', error);
      throw error.response?.data || { message: 'Failed to fetch transaction' };
    }
  }

  // Get transaction statistics
  async getTransactionStats(): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    totalCredits: number;
    totalDebits: number;
  }> {
    try {
      const transactions = await this.getTransactions();
      const data = transactions.data || [];

      const stats = {
        totalTransactions: data.length,
        successfulTransactions: data.filter(t => t.status === 'success').length,
        failedTransactions: data.filter(t => t.status === 'failed').length,
        pendingTransactions: data.filter(t => t.status === 'pending').length,
        totalCredits: data.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0),
        totalDebits: data.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0),
      };

      return stats;
    } catch (error: any) {
      console.error('Error fetching transaction stats:', error);
      throw error.response?.data || { message: 'Failed to fetch transaction stats' };
    }
  }

  // Format transaction for display
  formatTransactionDisplay(transaction: Transaction): {
    title: string;
    subtitle: string;
    amount: string;
    type: 'credit' | 'debit';
    status: 'success' | 'failed' | 'pending';
    date: string;
    icon: string;
    color: string;
  } {
    let title = 'Transaction';
    let subtitle = transaction.description || 'No description';
    let icon = 'exchange';
    let color = '#666666';

    // Determine transaction type details
    if (transaction.jobId && transaction.job) {
      title = transaction.job.title || 'Job Payment';
      subtitle = transaction.job.description || 'Job related transaction';
      icon = 'briefcase';
      color = '#3B82F6';
    } else if (transaction.productTransactionId && transaction.productTransaction) {
      const product = transaction.productTransaction.product;
      title = product?.name || 'Product Purchase';
      subtitle = `Quantity: ${transaction.productTransaction.quantity}`;
      icon = 'shopping-cart';
      color = '#10B981';
    } else if (transaction.description?.toLowerCase().includes('wallet')) {
      title = 'Wallet Transaction';
      subtitle = transaction.description || 'Wallet operation';
      icon = 'wallet';
      color = '#8B5CF6';
    } else if (transaction.description?.toLowerCase().includes('withdraw')) {
      title = 'Withdrawal';
      subtitle = 'Bank withdrawal';
      icon = 'arrow-down';
      color = '#F59E0B';
    }

    return {
      title,
      subtitle,
      amount: transaction.amount.toString(),
      type: transaction.type,
      status: transaction.status,
      date: new Date(transaction.timestamp).toLocaleDateString(),
      icon,
      color,
    };
  }

  // Group transactions by date
  groupTransactionsByDate(transactions: Transaction[]): { [date: string]: Transaction[] } {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as { [date: string]: Transaction[] });
  }
}

export const transactionService = new TransactionService();
export default transactionService;
