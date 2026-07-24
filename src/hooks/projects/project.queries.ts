/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { projectService } from '@/services/projectService';
import { proposalService } from '@/services/proposalService';
import { contractService } from '@/services/contractService';

const projectKeys = reactQueryKeys.projects;

export const useListProjects = (
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectService.getAll(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetProjectById = (
  id: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => projectService.getById(id!),
    enabled: (options?.enabled !== false) && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetProposalsByProjectId = (
  projectId: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: projectKeys.proposals(projectId!),
    queryFn: () => proposalService.getByProjectId(projectId!),
    enabled: (options?.enabled !== false) && !!projectId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetContractsByProjectId = (
  projectId: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: projectKeys.contracts(projectId!),
    queryFn: () => contractService.getByProjectId(projectId!),
    enabled: (options?.enabled !== false) && !!projectId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
