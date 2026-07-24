/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { userService } from '@/services/userService';

const userKeys = reactQueryKeys.users;

export const useListUsers = (
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    mode?: 'freelancer' | 'client';
    isVerifiedAsFreelancer?: boolean;
    isVerifiedAsClient?: boolean;
    specification?: string;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'avgRating';
    sortOrder?: 'asc' | 'desc';
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.list(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetUserById = (
  id: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => userService.getById(id!),
    enabled: (options?.enabled !== false) && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
