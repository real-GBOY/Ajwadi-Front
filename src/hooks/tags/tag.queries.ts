/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { tagService } from '@/services/tagService';

const tagKeys = reactQueryKeys.tags;

export const useListTags = (
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
      queryKey: tagKeys.list(filters),
      queryFn: () => tagService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
   });

export const useGetTagById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: tagKeys.detail(id),
      queryFn: () => tagService.getById(id),
      enabled: options?.enabled !== false && !!id,
   });
