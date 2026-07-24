/** @format */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experienceDemandService } from '@/services/experienceDemandService';
import type {
  ExperienceDemand,
  CreateExperienceDemandRequest,
  UpdateExperienceDemandRequest,
  ApproveExperienceDemandRequest,
  RejectExperienceDemandRequest,
} from '@/services/experienceDemandService';
import { reactQueryKeys } from '@/config/reactQueryKeys';

/**
 * Hook to list experience demands
 */
export function useListExperienceDemands(filters?: {
  page?: number;
  limit?: number;
  userId?: string;
  isUnderReview?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: reactQueryKeys.demands.experience.list(filters),
    queryFn: () => experienceDemandService.list(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to list experience demands under review
 */
export function useListExperienceDemandsUnderReview(filters?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: reactQueryKeys.demands.experience.underReview(filters),
    queryFn: () => experienceDemandService.listUnderReview(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get experience demand by ID
 */
export function useGetExperienceDemandById(id: string | number | null | undefined) {
  return useQuery({
    queryKey: reactQueryKeys.demands.experience.detail(id),
    queryFn: () => experienceDemandService.getById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to get experience demands count
 */
export function useGetExperienceDemandsCount(filters?: {
  userId?: string;
  isUnderReview?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}) {
  return useQuery({
    queryKey: reactQueryKeys.demands.experience.count(filters),
    queryFn: () => experienceDemandService.getCount(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to create experience demand
 */
export function useCreateExperienceDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExperienceDemandRequest) =>
      experienceDemandService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.list() });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.count() });
    },
  });
}

/**
 * Hook to update experience demand
 */
export function useUpdateExperienceDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateExperienceDemandRequest;
    }) => experienceDemandService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.list() });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.count() });
    },
  });
}

/**
 * Hook to approve experience demand
 */
export function useApproveExperienceDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload?: ApproveExperienceDemandRequest;
    }) => experienceDemandService.approve(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.list() });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.count() });
    },
  });
}

/**
 * Hook to reject experience demand
 */
export function useRejectExperienceDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: RejectExperienceDemandRequest;
    }) => experienceDemandService.reject(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.list() });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.count() });
    },
  });
}

/**
 * Hook to delete experience demand
 */
export function useDeleteExperienceDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => experienceDemandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.list() });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.demands.experience.count() });
    },
  });
}
