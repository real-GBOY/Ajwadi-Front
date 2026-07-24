/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { withdrawalService, type WithdrawalStatus } from '@/services/withdrawalService';

const withdrawalKeys = reactQueryKeys.withdrawals;

export const useListWithdrawals = (
  filters?: {
    page?: number;
    limit?: number;
    status?: WithdrawalStatus | 'all';
    userId?: string;
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: withdrawalKeys.list(filters),
    queryFn: () =>
      withdrawalService.listAll({
        page: filters?.page,
        limit: filters?.limit,
        status: filters?.status && filters.status !== 'all' ? (filters.status as WithdrawalStatus) : undefined,
        userId: filters?.userId,
      }),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

