/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { specificationService } from '@/services/specificationService';

const specificationKeys = reactQueryKeys.specifications;

export const useListSpecifications = (
   filters?: {
      page?: number;
      limit?: number;
      search?: string;
   },
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: specificationKeys.list(filters),
      queryFn: () => specificationService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
   });

export const useGetSpecificationById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: specificationKeys.detail(id),
      queryFn: () => specificationService.getById(id),
      enabled: options?.enabled !== false && !!id,
   });
