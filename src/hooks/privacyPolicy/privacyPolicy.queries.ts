/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { privacyPolicyService } from '@/services/privacyPolicyService';

const privacyPolicyKeys = reactQueryKeys.privacyPolicy;

export const useListPrivacyPolicies = (
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
      queryKey: privacyPolicyKeys.list(filters),
      queryFn: () => privacyPolicyService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
   });

export const useGetPrivacyPolicyById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: privacyPolicyKeys.detail(id),
      queryFn: () => privacyPolicyService.getById(id),
      enabled: options?.enabled !== false && !!id,
   });
