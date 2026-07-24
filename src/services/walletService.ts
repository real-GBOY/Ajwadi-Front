/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

// Types - Based on API DTO from wallet-api.http
export interface Transaction {
  id: string;
  userId?: string;
  amount: number | string;
  currency: string;
  type: 'TOP_UP' | 'CONTRACT' | 'ESCROW_RELEASE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  taxStatus?: 'TAXABLE' | 'NON_TAXABLE';
  fromWalletId?: string;
  toWalletId?: string;
  contractId?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TopUpRequest {
  amount: number;
}

export interface VerifyTransactionRequest {
  status: 'COMPLETED' | 'FAILED';
  description?: string;
  trace?: string;
  respondCode?: string;
  respondMessage?: string;
  respondStatus?: string;
  payResponseReturn?: string;
  token?: string;
  paymentInfo?: {
    cardScheme?: string;
    cardType?: string;
    paymentDescription?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
}

// Transform function
const transformTransaction = (item: any): Transaction => ({
  id: item.id,
  userId: item.userId,
  amount: item.amount,
  currency: item.currency || 'SAR',
  type: item.type,
  status: item.status,
  taxStatus: item.taxStatus,
  fromWalletId: item.fromWalletId,
  toWalletId: item.toWalletId,
  contractId: item.contractId,
  description: item.description,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// Service functions
export const walletService = {
  // GET /api/wallet/transactions/all - Get all transactions (Employee only)
  getAllTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get(endPoints.wallet.getAllTransactions);
    const backendData = response.data?.data || response.data || [];
    return Array.isArray(backendData) ? backendData.map(transformTransaction) : [];
  },

  // GET /api/wallet/transactions - Get user's transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get(endPoints.wallet.getTransactions);
    const backendData = response.data?.data || response.data || [];
    return Array.isArray(backendData) ? backendData.map(transformTransaction) : [];
  },

  // GET /api/wallet/transactions/:id - Get single transaction by ID
  getTransactionById: async (id: string | number): Promise<Transaction> => {
    const response = await apiClient.get(endPoints.wallet.getTransactionById(id));
    const data = response.data?.data || response.data;
    return transformTransaction(data);
  },

  // POST /api/wallet/top-up - Create top-up transaction
  topUp: async (payload: TopUpRequest): Promise<Transaction> => {
    const response = await apiClient.post(endPoints.wallet.topUp, payload);
    const data = response.data?.data || response.data;
    return transformTransaction(data);
  },

  // POST /api/wallet/transactions/:id/verify - Verify top-up transaction
  verifyTransaction: async (
    id: string | number,
    payload: VerifyTransactionRequest
  ): Promise<Transaction> => {
    const response = await apiClient.post(endPoints.wallet.verifyTransaction(id), payload);
    const data = response.data?.data || response.data;
    return transformTransaction(data);
  },

  // GET /api/wallet/transactions/taxable - Get taxable transactions
  getTaxableTransactions: async (filters?: {
    page?: number;
    limit?: number;
  }): Promise<TransactionListResponse> => {
    const response = await apiClient.get(endPoints.wallet.getTaxableTransactions, {
      params: filters,
    });

    const backendData = response.data?.data || response.data || {};
    const items = backendData.items || backendData.data || backendData || [];
    const paginationData =
      backendData.pagination || response.data?.pagination || {
        page: 1,
        limit: 20,
        total: Array.isArray(items) ? items.length : 0,
        pages: 1,
      };

    return {
      data: (Array.isArray(items) ? items : []).map(transformTransaction),
      pagination: {
        page: Number(paginationData.page || 1),
        limit: Number(paginationData.limit || 20),
        total: Number(paginationData.total || 0),
        total_pages: Number(paginationData.pages || 1),
      },
    };
  },
};
