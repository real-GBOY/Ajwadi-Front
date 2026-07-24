/** @format */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { reportService, type ReportStatus } from '@/services/reportService';

const reportKeys = reactQueryKeys.reports;

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: {
        status?: ReportStatus;
        details?: string;
        reasons?: string[];
      };
    }) => reportService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: reportKeys.detail(variables.id),
        });
      }
    },
  });
};

