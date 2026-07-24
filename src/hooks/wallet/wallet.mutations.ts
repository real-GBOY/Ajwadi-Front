/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import {
  walletService,
  type TopUpRequest,
  type VerifyTransactionRequest,
} from '@/services/walletService';

const walletKeys = reactQueryKeys.wallet;

export const useTopUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TopUpRequest) => walletService.topUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions.all() });
    },
  });
};

export const useVerifyTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: VerifyTransactionRequest;
    }) => walletService.verifyTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions.all() });
    },
  });
};
