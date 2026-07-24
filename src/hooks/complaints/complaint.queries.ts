/** @format */

import { ListComplaintsParams, ComplaintCountParams } from '@/services/complaintService';

export const reactQueryKeys = {
  complaints: {
    all: ['complaints'] as const,
    lists: () => [...reactQueryKeys.complaints.all, 'list'] as const,
    list: (params?: ListComplaintsParams) => [...reactQueryKeys.complaints.lists(), params] as const,
    details: () => [...reactQueryKeys.complaints.all, 'detail'] as const,
    detail: (id: string | number | null) => [...reactQueryKeys.complaints.details(), id] as const,
    counts: () => [...reactQueryKeys.complaints.all, 'count'] as const,
    count: (params?: ComplaintCountParams) => [...reactQueryKeys.complaints.counts(), params] as const,
  },
};
