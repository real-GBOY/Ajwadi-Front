/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { reportService, type ReportStatus } from '@/services/reportService';

const reportKeys = reactQueryKeys.reports;

export const useListReports = (
  filters?: {
    page?: number;
    limit?: number;
    status?: ReportStatus | 'all';
    userId?: string;
    projectId?: string | null;
    proposalId?: string | null;
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () =>
      reportService.listAll({
        page: filters?.page,
        limit: filters?.limit,
        status:
          filters?.status && filters.status !== 'all'
            ? (filters.status as ReportStatus)
            : undefined,
        userId: filters?.userId,
        projectId: filters?.projectId,
        proposalId: filters?.proposalId,
      }),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetReportById = (
  id: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: reportKeys.detail(id || 'null'),
    queryFn: () => reportService.getById(id as string | number),
    enabled: options?.enabled !== false && !!id,
  });

