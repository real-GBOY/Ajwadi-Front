/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import {
   specificationService,
   type CreateSpecificationRequest,
} from '@/services/specificationService';

const specificationKeys = reactQueryKeys.specifications;

export const useCreateSpecification = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreateSpecificationRequest) =>
         specificationService.create(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: specificationKeys.all });
      },
   });
};

export const useUpdateSpecification = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Partial<CreateSpecificationRequest>;
      }) => specificationService.update(id, payload),
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: specificationKeys.all });
         queryClient.invalidateQueries({
            queryKey: specificationKeys.detail(variables.id),
         });
      },
   });
};

export const useDeleteSpecification = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => specificationService.delete(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: specificationKeys.all });
      },
   });
};
