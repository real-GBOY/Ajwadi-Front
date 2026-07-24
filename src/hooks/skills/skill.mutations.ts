/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import {
   skillService,
   type CreateSkillRequest,
   type UpdateSkillRequest,
} from '@/services/skillService';

const skillKeys = reactQueryKeys.skills;

export const useCreateSkill = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreateSkillRequest) =>
         skillService.create(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: skillKeys.all });
      },
   });
};

export const useUpdateSkill = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Partial<CreateSkillRequest>;
      }) => skillService.update(id, payload),
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: skillKeys.all });
         queryClient.invalidateQueries({
            queryKey: skillKeys.detail(variables.id),
         });
      },
   });
};

export const useDeleteSkill = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => skillService.delete(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: skillKeys.all });
      },
   });
};

// Export UpdateSkillRequest type
export type UpdateSkillRequest = Partial<CreateSkillRequest>;
