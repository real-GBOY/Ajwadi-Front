/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import {
   privacyPolicyService,
   type CreatePrivacyPolicyRequest,
} from '@/services/privacyPolicyService';

const privacyPolicyKeys = reactQueryKeys.privacyPolicy;

export const useCreatePrivacyPolicy = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreatePrivacyPolicyRequest) =>
         privacyPolicyService.create(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: privacyPolicyKeys.all });
      },
   });
};

export const useUpdatePrivacyPolicy = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Partial<CreatePrivacyPolicyRequest>;
      }) => privacyPolicyService.update(id, payload),
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: privacyPolicyKeys.all });
         queryClient.invalidateQueries({
            queryKey: privacyPolicyKeys.detail(variables.id),
         });
      },
   });
};

export const useDeletePrivacyPolicy = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => privacyPolicyService.delete(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: privacyPolicyKeys.all });
      },
   });
};
