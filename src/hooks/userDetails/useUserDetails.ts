/** @format */

import { useQuery } from '@tanstack/react-query';
import { identityService } from '@/services/identityService';
import { proposalService } from '@/services/proposalService';
import { contractService } from '@/services/contractService';
import { projectService } from '@/services/projectService';

export const useGetUserIdentity = (userId: string | number | null) =>
  useQuery({
    queryKey: ['user-identity', userId],
    queryFn: () => identityService.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });

export const useGetUserProposals = (userId: string | number | null) =>
  useQuery({
    queryKey: ['user-proposals', userId],
    queryFn: () => proposalService.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });

export const useGetUserContracts = (
  userId: string | number | null,
  mode: 'client' | 'freelancer'
) =>
  useQuery({
    queryKey: ['user-contracts', userId, mode],
    queryFn: () => {
      if (mode === 'client') {
        return contractService.getByClientId(userId!);
      } else {
        return contractService.getByFreelancerId(userId!);
      }
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });

export const useGetUserProjects = (
  userId: string | number | null,
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }
) =>
  useQuery({
    queryKey: ['user-projects', userId, filters],
    queryFn: () => projectService.getByUserId(userId!, filters),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });
