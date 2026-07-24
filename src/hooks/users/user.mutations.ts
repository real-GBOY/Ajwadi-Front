/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { userService } from '@/services/userService';

const userKeys = reactQueryKeys.users;

export const useVerifyAsFreelancer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => userService.verifyAsFreelancer(id),
    onSuccess: (data) => {
      // Invalidate user detail query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useVerifyAsClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => userService.verifyAsClient(id),
    onSuccess: (data) => {
      // Invalidate user detail query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUnverifyAsFreelancer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => userService.unverifyAsFreelancer(id),
    onSuccess: (data) => {
      // Invalidate user detail query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUnverifyAsClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => userService.unverifyAsClient(id),
    onSuccess: (data) => {
      // Invalidate user detail query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
