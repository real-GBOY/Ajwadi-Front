/** @format */

import { useGetAllTransactions, useGetTransactions } from './wallet.queries';
import {
  useTopUp,
  useVerifyTransaction,
} from './wallet.mutations';

export const useWallet = () => {
  return {
    useGetAllTransactions,
    useGetTransactions,
    useTopUp,
    useVerifyTransaction,
  };
};

// Export individual hooks for direct imports
export { useGetAllTransactions, useGetTransactions, useGetTransactionById, useGetTaxableTransactions } from './wallet.queries';
export {
  useTopUp,
  useVerifyTransaction,
} from './wallet.mutations';
