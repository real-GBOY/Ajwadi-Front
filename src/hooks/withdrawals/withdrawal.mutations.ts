/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { withdrawalService, type WithdrawalStatus } from '@/services/withdrawalService';

const withdrawalKeys = reactQueryKeys.withdrawals;

export const useUpdateWithdrawalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string | number;
      status: WithdrawalStatus;
    }) => withdrawalService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: withdrawalKeys.detail(variables.id),
        });
      }
    },
  });
};

