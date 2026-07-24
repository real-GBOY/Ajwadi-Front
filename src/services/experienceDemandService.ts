/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface ExperienceDemand {
  id: string;
  userId: string;
  ExFile: string;
  isUnderReview: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    profilePicture?: string;
  };
  exFile?: {
    id: string;
    fileName: string;
    url: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
  };
}

export interface ExperienceDemandListResponse {
  data: ExperienceDemand[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ExperienceDemandCountResponse {
  count: number;
}

export interface CreateExperienceDemandRequest {
  ExFile: string;
  userId?: string;
}

export interface UpdateExperienceDemandRequest {
  isUnderReview?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  ExFile?: string;
}

export interface ApproveExperienceDemandRequest {
  reviewNote?: string;
}

export interface RejectExperienceDemandRequest {
  reviewNote: string; // Required for rejection
}

export const experienceDemandService = {
  /**
   * Get all experience demands with optional filters
   */
  list: async (filters?: {
    page?: number;
    limit?: number;
    userId?: string;
    isUnderReview?: boolean;
    reviewStatus?: 'pending' | 'approved' | 'rejected';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ExperienceDemandListResponse> => {
    const response = await apiClient.get(endPoints.demands.experience.getAll, {
      params: filters,
    });

    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      data: dataArray,
      pagination: {
        currentPage: Number(pagination.currentPage || 1),
        itemsPerPage: Number(pagination.itemsPerPage || 10),
        totalItems: Number(pagination.totalItems || 0),
        totalPages: Number(pagination.totalPages || 0),
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPreviousPage: Boolean(pagination.hasPreviousPage),
      },
    };
  },

  /**
   * Get experience demands under review
   */
  listUnderReview: async (filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ExperienceDemandListResponse> => {
    const response = await apiClient.get(endPoints.demands.experience.getUnderReview, {
      params: filters,
    });

    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      data: dataArray,
      pagination: {
        currentPage: Number(pagination.currentPage || 1),
        itemsPerPage: Number(pagination.itemsPerPage || 10),
        totalItems: Number(pagination.totalItems || 0),
        totalPages: Number(pagination.totalPages || 0),
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPreviousPage: Boolean(pagination.hasPreviousPage),
      },
    };
  },

  /**
   * Get experience demand by ID
   */
  getById: async (id: string | number): Promise<ExperienceDemand> => {
    const response = await apiClient.get(endPoints.demands.experience.getById(id));
    return response.data?.data || response.data;
  },

  /**
   * Get experience demands count
   */
  getCount: async (filters?: {
    userId?: string;
    isUnderReview?: boolean;
    reviewStatus?: 'pending' | 'approved' | 'rejected';
  }): Promise<number> => {
    const response = await apiClient.get(endPoints.demands.experience.getCount, {
      params: filters,
    });
    const data = response.data?.data || response.data;
    return Number(data?.count || 0);
  },

  /**
   * Create experience demand
   */
  create: async (payload: CreateExperienceDemandRequest): Promise<ExperienceDemand> => {
    const response = await apiClient.post(endPoints.demands.experience.create, payload);
    return response.data?.data || response.data;
  },

  /**
   * Update experience demand
   */
  update: async (
    id: string | number,
    payload: UpdateExperienceDemandRequest
  ): Promise<ExperienceDemand> => {
    const response = await apiClient.put(endPoints.demands.experience.update(id), payload);
    return response.data?.data || response.data;
  },

  /**
   * Approve experience demand
   */
  approve: async (
    id: string | number,
    payload?: ApproveExperienceDemandRequest
  ): Promise<ExperienceDemand> => {
    const response = await apiClient.patch(endPoints.demands.experience.approve(id), payload || {});
    return response.data?.data || response.data;
  },

  /**
   * Reject experience demand
   */
  reject: async (
    id: string | number,
    payload: RejectExperienceDemandRequest
  ): Promise<ExperienceDemand> => {
    const response = await apiClient.patch(endPoints.demands.experience.reject(id), payload);
    return response.data?.data || response.data;
  },

  /**
   * Delete experience demand
   */
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(endPoints.demands.experience.delete(id));
  },
};

export default experienceDemandService;
