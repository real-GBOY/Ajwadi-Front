/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { contractService } from '@/services/contractService';

const contractKeys = reactQueryKeys.contracts;

export const useListContracts = (
  filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: contractKeys.list(filters),
    queryFn: () => contractService.getLatest(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetContractById = (
  id: string | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: contractKeys.detail(id || ''),
    queryFn: () => contractService.getById(id!),
    enabled: options?.enabled !== false && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetContractHistory = (
  projectId: string | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: [...contractKeys.all, 'history', projectId],
    queryFn: () => contractService.getHistory(projectId!),
    enabled: options?.enabled !== false && !!projectId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetContractTransactions = (
  transactionIds: string[] | undefined,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: [...contractKeys.all, 'transactions', transactionIds],
    queryFn: () => contractService.getTransactions(transactionIds || []),
    enabled: options?.enabled !== false && !!transactionIds && transactionIds.length > 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetContractFinancial = (
  id: string | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: [...contractKeys.detail(id || ''), 'financial'],
    queryFn: () => contractService.getFinancial(id!),
    enabled: options?.enabled !== false && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
