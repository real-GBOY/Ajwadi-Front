/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import {
   tagService,
   type CreateTagRequest,
} from '@/services/tagService';

const tagKeys = reactQueryKeys.tags;

export const useCreateTag = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreateTagRequest) => tagService.create(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tagKeys.all });
      },
   });
};

export const useUpdateTag = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Partial<CreateTagRequest>;
      }) => tagService.update(id, payload),
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: tagKeys.all });
         queryClient.invalidateQueries({
            queryKey: tagKeys.detail(variables.id),
         });
      },
   });
};

export const useDeleteTag = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => tagService.delete(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tagKeys.all });
      },
   });
};
