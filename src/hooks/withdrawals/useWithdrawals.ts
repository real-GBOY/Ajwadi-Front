/** @format */

import { useListWithdrawals } from './withdrawal.queries';
import { useUpdateWithdrawalStatus } from './withdrawal.mutations';

export const useWithdrawals = () => {
  return {
    useListWithdrawals,
    useUpdateWithdrawalStatus,
  };
};

export { useListWithdrawals } from './withdrawal.queries';
export { useUpdateWithdrawalStatus } from './withdrawal.mutations';

