/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { walletService } from '@/services/walletService';

const walletKeys = reactQueryKeys.wallet;

export const useGetAllTransactions = (
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: walletKeys.transactions.allTransactions(),
    queryFn: () => walletService.getAllTransactions(),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetTransactions = (
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: walletKeys.transactions.list(),
    queryFn: () => walletService.getTransactions(),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetTransactionById = (
  id: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: [...walletKeys.transactions.all(), 'detail', id],
    queryFn: () => walletService.getTransactionById(id as string | number),
    enabled: options?.enabled !== false && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetTaxableTransactions = (
  filters?: {
    page?: number;
    limit?: number;
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: walletKeys.transactions.taxable(filters),
    queryFn: () => walletService.getTaxableTransactions(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
