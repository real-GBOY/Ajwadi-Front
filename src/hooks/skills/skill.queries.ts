/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { skillService } from '@/services/skillService';

const skillKeys = reactQueryKeys.skills;

export const useListSkills = (
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
      queryKey: skillKeys.list(filters),
      queryFn: () => skillService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
   });

export const useGetSkillById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: skillKeys.detail(id),
      queryFn: () => skillService.getById(id),
      enabled: options?.enabled !== false && !!id,
   });
