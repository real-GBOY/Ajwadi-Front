/** @format */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { demandService } from '@/services/demandService';

const demandKeys = reactQueryKeys.demands;

export const useListVerificationDemands = (
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    mode?: 'freelancer' | 'client';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: demandKeys.verification.list(filters),
    queryFn: () => demandService.verification.list(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetVerificationDemandsCount = (
  filters?: {
    search?: string;
    mode?: 'freelancer' | 'client';
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: demandKeys.verification.count(filters),
    queryFn: () => demandService.verification.getCount(filters),
    enabled: options?.enabled !== false,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

export const useListTagAttachmentDemands = (
  filters?: {
    page?: number;
    limit?: number;
    tagId?: string;
    userId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: demandKeys.tagAttachments.list(filters),
    queryFn: () => demandService.tagAttachments.list(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetTagAttachmentDemandsCount = (
  filters?: {
    tagId?: string;
    userId?: string;
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: demandKeys.tagAttachments.count(filters),
    queryFn: () => demandService.tagAttachments.getCount(filters),
    enabled: options?.enabled !== false,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

/**
 * Hook to accept tag attachment
 */
export const useAcceptTagAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => demandService.tagAttachments.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: demandKeys.tagAttachments.list() });
      queryClient.invalidateQueries({ queryKey: demandKeys.tagAttachments.count() });
    },
  });
};

/**
 * Hook to reject tag attachment
 */
export const useRejectTagAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: string | number;
      rejectionReason: string;
    }) => demandService.tagAttachments.reject(id, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: demandKeys.tagAttachments.list() });
      queryClient.invalidateQueries({ queryKey: demandKeys.tagAttachments.count() });
    },
  });
};
