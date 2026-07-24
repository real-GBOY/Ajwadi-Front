/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface Contract {
  id: string;
  proposalId: string;
  clientId: string;
  termsAndConditions: string;
  value: number | string;
  paidValue: number | string;
  duration: number;
  emergencyduration: number;
  startdate: string;
  clientapproval: boolean;
  freelancerapproval: boolean;
  status: string;
  version?: number;
  escrowWalletId?: string;
  transactionIds?: string[];
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewedStatus?: string;
  reviewedNote?: string | null;
  clientRejectionReason?: string | null;
  previousContractId?: string | null;
  createdAt: string;
  updatedAt: string;
  proposalData?: {
    id: string;
    projectId: string;
    description: string;
    budget: number | string;
    duration: number;
    status?: string;
    FavoriteProposal?: boolean;
    createdAt?: string;
  };
  clientData?: {
    id: string;
    name: string;
    phone: string;
    country?: string;
    mode?: string;
    overview?: string;
    jobTitle?: string;
    isVerifiedAsFreelancer?: boolean;
    isVerifiedAsClient?: boolean;
    avgRating?: number | string;
    totalReviews?: number;
    available?: boolean;
    profilePicture?: {
      id: string;
      url: string;
      fileName: string;
      fileType: string;
      filePurpose: string;
      mimeType?: string;
      fileSize?: number;
      status?: string;
    } | null;
  };
  freelancerData?: {
    id: string;
    name: string;
    phone: string;
    country?: string;
    mode?: string;
    overview?: string;
    jobTitle?: string;
    isVerifiedAsFreelancer?: boolean;
    isVerifiedAsClient?: boolean;
    avgRating?: number | string;
    totalReviews?: number;
    available?: boolean;
    profilePicture?: {
      id: string;
      url: string;
      fileName: string;
      fileType: string;
      filePurpose: string;
      mimeType?: string;
      fileSize?: number;
      status?: string;
    } | null;
  };
  reviewerData?: {
    id: string;
    name: string;
  } | null;
}

export interface ContractListResponse {
  data: Contract[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface Transaction {
  id: string;
  userId?: string;
  amount: number | string;
  currency: string;
  type: string;
  status: string;
  fromWalletId?: string;
  toWalletId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EscrowWallet {
  id: string;
  projectId?: string;
  pendingBalance: number | string;
  releasedBalance: number | string;
  status: string;
  currency: string;
}

export interface FinancialSummary {
  totalValue: number | string;
  paidValue: number | string;
  remainingBalance: number | string;
  pendingBalance: number | string;
  releasedBalance: number | string;
  totalDeposited: number | string;
  totalReleased: number | string;
  totalRefunded: number | string;
  currency: string;
}

export interface ContractFinancialData {
  contract: Contract;
  transactions: Transaction[];
  escrowWallet?: EscrowWallet;
  financialSummary: FinancialSummary;
}

export const contractService = {
  getById: async (id: string | number): Promise<Contract> => {
    const response = await apiClient.get(endPoints.contracts.getById(id));
    const backendData = response.data;
    return backendData.data || backendData;
  },

  getFinancial: async (id: string | number): Promise<ContractFinancialData> => {
    const response = await apiClient.get(endPoints.contracts.getFinancial(id));
    const backendData = response.data;
    return backendData.data || backendData;
  },

  getHistory: async (projectId: string | number): Promise<Contract[]> => {
    const response = await apiClient.get(endPoints.contracts.getHistory(projectId));
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  getTransactions: async (transactionIds: string[]): Promise<Transaction[]> => {
    if (!transactionIds || transactionIds.length === 0) {
      return [];
    }
    // Get all transactions and filter by contract transaction IDs
    const response = await apiClient.get(endPoints.wallet.getAllTransactions);
    const allTransactions = response.data?.data || response.data || [];
    return Array.isArray(allTransactions)
      ? allTransactions.filter((t: Transaction) => transactionIds.includes(t.id))
      : [];
  },

  getLatest: async (
    filters?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<ContractListResponse> => {
    const response = await apiClient.get(endPoints.contracts.getLatest, {
      params: filters,
    });

    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      data: dataArray,
      pagination: {
        currentPage: Number(pagination.currentPage || 1),
        itemsPerPage: Number(pagination.itemsPerPage || 10),
        totalItems: Number(pagination.totalItems || 0),
        totalPages: Number(pagination.totalPages || 0),
        hasNextPage: Boolean(pagination.hasNextPage || false),
        hasPreviousPage: Boolean(pagination.hasPreviousPage || false),
      },
    };
  },

  getByClientId: async (clientId: string | number): Promise<Contract[]> => {
    const response = await apiClient.get(endPoints.contracts.getByClientId(clientId));
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  getByFreelancerId: async (freelancerId: string | number): Promise<Contract[]> => {
    const response = await apiClient.get(endPoints.contracts.getByFreelancerId(freelancerId));
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  getByProjectId: async (projectId: string | number): Promise<Contract[]> => {
    const response = await apiClient.get(endPoints.contracts.getByProjectId(projectId));
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },
};

export default contractService;
