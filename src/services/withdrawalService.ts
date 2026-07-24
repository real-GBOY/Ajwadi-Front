/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export type WithdrawalStatus = 'pending' | 'completed' | 'failed';

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankAccountId: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface WithdrawalListResponse {
  data: Withdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const transformWithdrawal = (item: any): Withdrawal => ({
  id: item.id,
  userId: item.userId,
  amount: item.amount,
  bankAccountId: item.bankAccountId,
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const withdrawalService = {
  listAll: async (filters?: {
    page?: number;
    limit?: number;
    status?: WithdrawalStatus;
    userId?: string;
  }): Promise<WithdrawalListResponse> => {
    const response = await apiClient.get(endPoints.withdrawals.getAll, {
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
      data: (Array.isArray(items) ? items : []).map(transformWithdrawal),
      pagination: {
        page: Number(paginationData.page || 1),
        limit: Number(paginationData.limit || 20),
        total: Number(paginationData.total || 0),
        pages: Number(paginationData.pages || 1),
      },
    };
  },

  updateStatus: async (
    id: string | number,
    status: WithdrawalStatus
  ): Promise<Withdrawal> => {
    const response = await apiClient.patch(
      endPoints.withdrawals.updateStatus(id),
      { status }
    );
    const data = response.data?.data || response.data;
    return transformWithdrawal(data);
  },
};

