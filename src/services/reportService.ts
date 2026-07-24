/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export type ReportStatus = 'open' | 'reviewed' | 'resolved';

export interface Report {
  id: string;
  userId: string;
  projectId?: string | null;
  proposalId?: string | null;
  reasons?: string[];
  details?: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportListResponse {
  data: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const transformReport = (item: any): Report => ({
  id: item.id,
  userId: item.userId,
  projectId: item.projectId ?? null,
  proposalId: item.proposalId ?? null,
  reasons: item.reasons ?? [],
  details: item.details ?? '',
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const reportService = {
  listAll: async (filters?: {
    page?: number;
    limit?: number;
    status?: ReportStatus;
    userId?: string;
    projectId?: string | null;
    proposalId?: string | null;
  }): Promise<ReportListResponse> => {
    const response = await apiClient.get(endPoints.reports.list, {
      params: filters,
    });

    const backendData = response.data?.data || response.data || {};
    const items = backendData.data || backendData.items || backendData || [];
    const paginationData =
      backendData.pagination || response.data?.pagination || {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: Array.isArray(items) ? items.length : 0,
        totalPages: 1,
      };

    return {
      data: (Array.isArray(items) ? items : []).map(transformReport),
      pagination: {
        page: Number(paginationData.currentPage || paginationData.page || 1),
        limit: Number(paginationData.itemsPerPage || paginationData.limit || 20),
        total: Number(paginationData.totalItems || paginationData.total || 0),
        pages: Number(paginationData.totalPages || paginationData.pages || 1),
      },
    };
  },

  getById: async (id: string | number): Promise<Report> => {
    const response = await apiClient.get(endPoints.reports.getById(id));
    const data = response.data?.data || response.data;
    return transformReport(data);
  },

  update: async (
    id: string | number,
    payload: {
      status?: ReportStatus;
      details?: string;
      reasons?: string[];
    }
  ): Promise<Report> => {
    const response = await apiClient.patch(endPoints.reports.update(id), payload);
    const data = response.data?.data || response.data;
    return transformReport(data);
  },
};

